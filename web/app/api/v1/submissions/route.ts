import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { submissionOpen, submissionDeadline } from "@/lib/hackathon";

const createSchema = z.object({
  hackathonId: z.string().min(1),
  title: z.string().min(1),
  content: z.record(z.any()).default({}),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string().default("application/octet-stream"),
        size: z.number().default(0),
      })
    )
    .default([]),
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

async function getUserTeamForHackathon(userId: string, hackathonId: string) {
  return prisma.hackathonTeam.findFirst({
    where: { hackathonId, members: { some: { userId } } },
    include: { members: true },
  });
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

    const submission = await prisma.$transaction(async (tx) => {
      let sub;
      if (existing) {
        sub = await tx.hackathonSubmission.update({
          where: { id: existing.id },
          data: {
            title,
            content,
            status: "SUBMITTED",
          },
        });
        await tx.submissionFile.deleteMany({ where: { submissionId: existing.id } });
      } else {
        sub = await tx.hackathonSubmission.create({
          data: {
            hackathonId,
            teamId: team.id,
            title,
            content,
            status: "SUBMITTED",
          },
        });
      }

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

      return sub;
    });

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
