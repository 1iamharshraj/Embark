import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { registrationOpen } from "@/lib/hackathon";
import { createNotification } from "@/lib/notifications";

const registerSchema = z.object({
  teamName: z.string().optional(),
  members: z.array(z.object({ name: z.string(), email: z.string().email() })).default([]),
});

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

    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.hackathonRegistration.create({
        data: {
          hackathonId: hackathon.id,
          userId: user.id,
          status: "REGISTERED",
          formData: { teamName: data.teamName || "", members: data.members },
        },
      });

      const teamName = data.teamName || user.name || "Solo";
      const team = await tx.hackathonTeam.create({
        data: {
          hackathonId: hackathon.id,
          name: teamName,
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
