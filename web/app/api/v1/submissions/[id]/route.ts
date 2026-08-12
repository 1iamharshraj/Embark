import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { submissionOpen } from "@/lib/hackathon";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.record(z.any()).optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string().default("application/octet-stream"),
        size: z.number().default(0),
      })
    )
    .optional(),
});

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

    const { title, content, files } = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      const data: { title: string; status: string; content?: object } = {
        title: title ?? submission.title,
        status: "SUBMITTED",
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
            data: files.map((f, i) => ({
              submissionId: sub.id,
              name: f.name,
              url: f.url,
              type: f.type,
              size: f.size,
              version: i + 1,
            })),
          });
        }
      }

      return sub;
    });

    return NextResponse.json({ submission: updated });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Update submission error:", error);
    return NextResponse.json({ message: "Failed to update submission" }, { status: 500 });
  }
}
