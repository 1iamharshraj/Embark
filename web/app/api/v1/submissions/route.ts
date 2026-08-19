import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { submissionOpen, submissionDeadline } from "@/lib/hackathon";
import { createAuditLog } from "@/lib/audit";
import { notifyHackathonSubmission, scheduleSubmissionDeadlineReminder } from "@/lib/notifications";

const fileSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string().default("application/octet-stream"),
  size: z.number().default(0),
});

const createSchema = z.object({
  hackathonId: z.string().min(1),
  title: z.string().min(1),
  content: z.record(z.any()).default({}),
  files: z.array(fileSchema).default([]),
});

const LOCKED_STATUSES = ["LOCKED", "UNDER_EVALUATION", "EVALUATED", "SHORTLISTED", "WINNER", "REJECTED"];

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

async function getUserTeamForHackathon(userId: string, hackathonId: string) {
  return prisma.hackathonTeam.findFirst({
    where: { hackathonId, members: { some: { userId } } },
    include: { members: true },
  });
}

function parseFileRestrictions(settings: unknown) {
  const s = (settings || {}) as Record<string, unknown>;
  const raw = s.fileRestrictions as Record<string, unknown> | undefined;
  if (!raw) return null;
  return {
    allowedTypes: Array.isArray(raw.allowedTypes)
      ? raw.allowedTypes.filter((v): v is string => typeof v === "string")
      : [],
    maxFileSize: typeof raw.maxFileSize === "number" ? raw.maxFileSize : undefined,
    maxFiles: typeof raw.maxFiles === "number" ? raw.maxFiles : undefined,
    requiredFiles: Array.isArray(raw.requiredFiles)
      ? raw.requiredFiles.filter((v): v is string => typeof v === "string")
      : [],
  };
}

function validateFiles(
  files: { name: string; size: number; type: string }[],
  restrictions: ReturnType<typeof parseFileRestrictions>
): string | null {
  if (!restrictions) return null;

  if (restrictions.maxFiles && files.length > restrictions.maxFiles) {
    return `Maximum ${restrictions.maxFiles} files allowed.`;
  }

  for (const file of files) {
    if (restrictions.maxFileSize && file.size > restrictions.maxFileSize * 1024 * 1024) {
      return `${file.name} exceeds the ${restrictions.maxFileSize} MB size limit.`;
    }
    if (restrictions.allowedTypes && restrictions.allowedTypes.length > 0) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const allowed = restrictions.allowedTypes.some(
        (t) => t.toLowerCase() === ext || file.type.toLowerCase().includes(t.toLowerCase().replace(".", ""))
      );
      if (!allowed) return `${file.name} is not an allowed file type.`;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { hackathonId, title, content, files } = parsed.data;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: { timelines: { orderBy: { startsAt: "asc" } } },
    });

    if (!hackathon) {
      return NextResponse.json({ message: "Hackathon not found" }, { status: 404 });
    }

    const team = await getUserTeamForHackathon(user.id, hackathonId);
    if (!team) {
      return NextResponse.json({ message: "You must register for this hackathon first" }, { status: 403 });
    }

    if (!submissionOpen(hackathon) && !user.isAdmin) {
      const deadline = submissionDeadline(hackathon);
      const msg = deadline && new Date() > deadline ? "Submission deadline has passed" : "Submissions are not open yet";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    const existing = await prisma.hackathonSubmission.findFirst({
      where: { hackathonId, teamId: team.id },
    });

    if (existing && LOCKED_STATUSES.includes(existing.status) && !user.isAdmin) {
      return NextResponse.json({ message: "Submission is locked and cannot be changed" }, { status: 403 });
    }

    const restrictions = parseFileRestrictions(hackathon.settings);
    const fileError = validateFiles(files, restrictions);
    if (fileError) {
      return NextResponse.json({ message: fileError }, { status: 400 });
    }

    const submission = await prisma.$transaction(async (tx) => {
      let sub;
      const nextVersion = existing ? existing.version + 1 : 1;
      if (existing) {
        sub = await tx.hackathonSubmission.update({
          where: { id: existing.id },
          data: {
            title,
            content,
            status: "UPDATED",
            version: nextVersion,
          },
        });
      } else {
        sub = await tx.hackathonSubmission.create({
          data: {
            hackathonId,
            teamId: team.id,
            title,
            content,
            status: "SUBMITTED",
            version: nextVersion,
          },
        });
      }

      if (files.length > 0) {
        await tx.submissionFile.createMany({
          data: files.map((f) => ({
            submissionId: sub.id,
            name: f.name,
            url: f.url,
            type: f.type,
            size: f.size,
            version: nextVersion,
          })),
        });
      }

      return sub;
    });

    try {
      await createAuditLog({
        userId: user.id,
        action: existing ? "SUBMISSION_UPDATE" : "SUBMISSION_CREATE",
        resource: "HackathonSubmission",
        resourceId: submission.id,
        newValue: { hackathonId, teamId: team.id, version: submission.version },
      });
    } catch (err) {
      console.error("Submission audit log failed:", err);
    }

    try {
      await notifyHackathonSubmission(user.id, hackathon.id, hackathon.title, title);
      const deadline = submissionDeadline(hackathon);
      if (deadline) {
        await scheduleSubmissionDeadlineReminder(user.id, hackathon.id, hackathon.title, deadline);
      }
    } catch (err) {
      console.error("Submission notification failed:", err);
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Create submission error:", error);
    return NextResponse.json({ message: "Failed to submit" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get("hackathonId");

    if (!hackathonId) {
      return NextResponse.json({ message: "hackathonId required" }, { status: 400 });
    }

    const team = await getUserTeamForHackathon(user.id, hackathonId);
    if (!team && !user.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const where = user.isAdmin ? { hackathonId } : { hackathonId, teamId: team?.id };
    const submissions = await prisma.hackathonSubmission.findMany({
      where,
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Fetch submissions error:", error);
    return NextResponse.json({ message: "Failed to fetch submissions" }, { status: 500 });
  }
}
