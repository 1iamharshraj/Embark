import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { registrationOpen } from "@/lib/hackathon";
import { createNotification } from "@/lib/notifications";
import { createAuditLog } from "@/lib/audit";

const memberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  college: z.string().min(1),
  course: z.string().min(1),
  year: z.number().int().min(1).max(10),
  specialization: z.string().optional(),
  linkedIn: z.string().optional(),
  resume: z.string().optional(),
  customAnswers: z.record(z.union([z.string(), z.boolean(), z.number()])).default({}),
  teamName: z.string().optional(),
  members: z.array(memberSchema).default([]),
});

type EligibilityConfig = {
  userTypes?: string[];
  colleges?: string[];
  courses?: string[];
  years?: number[];
  geography?: string[];
  mode?: "INDIVIDUAL" | "TEAM" | "BOTH";
  teamMin?: number;
  teamMax?: number;
};

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string").map((v) => v.toLowerCase().trim());
  return [];
}

function checkEligibility(
  hackathon: {
    participationMode: string;
    teamMin: number;
    teamMax: number;
    eligibility?: unknown;
  },
  user: { userType?: string; college?: string; course?: string; year?: number },
  teamSize: number
): string | null {
  const eligibility = (hackathon.eligibility || {}) as EligibilityConfig;

  const mode = eligibility.mode || hackathon.participationMode;
  if (mode === "INDIVIDUAL" && teamSize > 1) {
    return "This hackathon is individual only.";
  }
  if (mode === "TEAM" && teamSize < 2) {
    return "This hackathon requires a team.";
  }

  const minSize = eligibility.teamMin ?? hackathon.teamMin;
  const maxSize = eligibility.teamMax ?? hackathon.teamMax;
  if (teamSize < minSize || teamSize > maxSize) {
    return `Team size must be between ${minSize} and ${maxSize}.`;
  }

  if (user.college) {
    const allowedColleges = normalizeArray(eligibility.colleges);
    if (allowedColleges.length > 0 && !allowedColleges.includes(user.college.toLowerCase().trim())) {
      return "Your college is not eligible for this hackathon.";
    }
  }

  if (user.course) {
    const allowedCourses = normalizeArray(eligibility.courses);
    if (allowedCourses.length > 0 && !allowedCourses.includes(user.course.toLowerCase().trim())) {
      return "Your course is not eligible for this hackathon.";
    }
  }

  if (user.year !== undefined && user.year !== null) {
    const allowedYears = Array.isArray(eligibility.years)
      ? eligibility.years.filter((v): v is number => typeof v === "number")
      : [];
    if (allowedYears.length > 0 && !allowedYears.includes(user.year)) {
      return `Year ${user.year} is not eligible for this hackathon.`;
    }
  }

  if (user.userType) {
    const allowedUserTypes = normalizeArray(eligibility.userTypes);
    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.userType.toLowerCase().trim())) {
      return "Your user type is not eligible for this hackathon.";
    }
  }

  return null;
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { slug: params.slug },
      include: { timelines: { orderBy: { startsAt: "asc" } } },
    });

    if (!hackathon) {
      return NextResponse.json({ message: "Hackathon not found" }, { status: 404 });
    }

    if (hackathon.status === "DRAFT" && !user.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!registrationOpen(hackathon) && !user.isAdmin) {
      return NextResponse.json({ message: "Registration is closed" }, { status: 400 });
    }

    const existing = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ message: "Already registered" }, { status: 409 });
    }

    const data = parsed.data;
    const teamSize = 1 + data.members.filter((m) => m.email?.trim()).length;

    const eligibilityError = checkEligibility(
      hackathon,
      {
        userType: user.isAdmin ? "ADMIN" : "STUDENT",
        college: data.college,
        course: data.course,
        year: data.year,
      },
      teamSize
    );
    if (eligibilityError && !user.isAdmin) {
      return NextResponse.json({ message: eligibilityError }, { status: 403 });
    }

    const registration = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: data.name,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || "",
          college: data.college,
        },
      });

      const studentProfile = await tx.studentProfile.findUnique({ where: { userId: user.id } });
      if (studentProfile) {
        await tx.studentProfile.update({
          where: { userId: user.id },
          data: {
            college: data.college,
            degree: data.course,
            graduationYear: data.year,
            specialization: data.specialization || studentProfile.specialization,
          },
        });
      } else {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            college: data.college,
            degree: data.course,
            graduationYear: data.year,
            specialization: data.specialization || "",
          },
        });
      }

      const reg = await tx.hackathonRegistration.create({
        data: {
          hackathonId: hackathon.id,
          userId: user.id,
          status: "REGISTERED",
          formData: {
            name: data.name,
            email: data.email.toLowerCase().trim(),
            phone: data.phone || "",
            college: data.college,
            course: data.course,
            year: data.year,
            specialization: data.specialization || "",
            linkedIn: data.linkedIn || "",
            resume: data.resume || "",
            customAnswers: data.customAnswers,
            teamName: data.teamName || "",
            members: data.members,
          },
        },
      });

      const finalTeamName = data.teamName?.trim() || user.name || "Solo";
      const team = await tx.hackathonTeam.create({
        data: {
          hackathonId: hackathon.id,
          name: finalTeamName,
          leaderId: user.id,
        },
      });

      await tx.hackathonTeamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
          role: "LEADER",
        },
      });

      if (hackathon.participationMode === "TEAM" && data.members.length > 0) {
        for (const member of data.members) {
          const memberEmail = member.email?.toLowerCase().trim();
          if (!memberEmail) continue;
          const memberUser = await tx.user.findUnique({ where: { email: memberEmail } });
          if (!memberUser || memberUser.id === user.id) continue;
          const alreadyMember = await tx.hackathonTeamMember.findUnique({
            where: { teamId_userId: { teamId: team.id, userId: memberUser.id } },
          });
          if (alreadyMember) continue;
          await tx.hackathonTeamMember.create({
            data: {
              teamId: team.id,
              userId: memberUser.id,
              role: "MEMBER",
            },
          });
        }
      }

      return reg;
    });

    try {
      await createAuditLog({
        userId: user.id,
        action: "HACKATHON_REGISTER",
        resource: "HackathonRegistration",
        resourceId: registration.id,
        newValue: { hackathonId: hackathon.id, teamSize },
      });
    } catch (err) {
      console.error("Registration audit log failed:", err);
    }

    try {
      await createNotification({
        userId: user.id,
        type: "HACKATHON_REGISTRATION",
        title: "Hackathon registration confirmed",
        message: `You are registered for ${hackathon.title}.`,
        entityType: "Hackathon",
        entityId: hackathon.id,
        sendEmail: true,
        email: user.email
          ? {
              to: user.email,
              subject: "Hackathon registration confirmed",
              html: `<p>Hi ${escapeHtml(user.name || "there")},</p><p>You are registered for <strong>${escapeHtml(
                hackathon.title
              )}</strong>.</p><p>— Embark India</p>`,
              text: `Hi ${user.name || "there"},\n\nYou are registered for ${hackathon.title}.\n\n— Embark India`,
            }
          : undefined,
      });
    } catch (err) {
      console.error("Registration notification failed:", err);
    }

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Hackathon registration error:", error);
    return NextResponse.json({ message: "Failed to register" }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
