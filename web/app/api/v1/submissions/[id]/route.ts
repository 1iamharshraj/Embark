import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { submissionOpen } from "@/lib/hackathon";
import { createAuditLog } from "@/lib/audit";

const fileSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string().default("application/octet-stream"),
  size: z.number().default(0),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.record(z.any()).optional(),
  files: z.array(fileSchema).optional(),
});

const LOCKED_STATUSES = ["LOCKED", "UNDER_EVALUATION", "EVALUATED", "SHORTLISTED", "WINNER", "REJECTED"];

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

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const submission = await prisma.hackathonSubmission.findUnique({
      where: { id: params.id },
      include: {
        hackathon: { include: { timelines: { orderBy: { startsAt: "asc" } } } },
        team: { include: { members: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    const isMember = submission.team.members.some((m) => m.userId === user.id);
    if (!isMember && !user.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!submissionOpen(submission.hackathon) && !user.isAdmin) {
      return NextResponse.json({ message: "Submissions are closed" }, { status: 400 });
    }

    if (LOCKED_STATUSES.includes(submission.status) && !user.isAdmin) {
      return NextResponse.json({ message: "Submission is locked and cannot be changed" }, { status: 403 });
    }

    const { title, content, files } = parsed.data;

    const restrictions = parseFileRestrictions(submission.hackathon.settings);
    if (files) {
      const fileError = validateFiles(files, restrictions);
      if (fileError) {
        return NextResponse.json({ message: fileError }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const nextVersion = submission.version + 1;
      const data: { title: string; status: string; content?: object; version: number } = {
        title: title ?? submission.title,
        status: "UPDATED",
        version: nextVersion,
      };
      if (content) {
        data.content = content as object;
      }
      const sub = await tx.hackathonSubmission.update({
        where: { id: params.id },
        data,
      });

      if (files) {
        await tx.submissionFile.deleteMany({ where: { submissionId: params.id } });
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
      }

      return sub;
    });

    try {
      await createAuditLog({
        userId: user.id,
        action: "SUBMISSION_UPDATE",
        resource: "HackathonSubmission",
        resourceId: updated.id,
        newValue: { hackathonId: submission.hackathonId, teamId: submission.teamId, version: updated.version },
      });
    } catch (err) {
      console.error("Submission audit log failed:", err);
    }

    return NextResponse.json({ submission: updated });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Update submission error:", error);
    return NextResponse.json({ message: "Failed to update submission" }, { status: 500 });
  }
}
