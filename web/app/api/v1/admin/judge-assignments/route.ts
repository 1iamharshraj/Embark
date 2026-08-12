import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

const assignSchema = z.object({
  judgeId: z.string().min(1),
  submissionId: z.string().min(1),
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

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.update");

    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { judgeId, submissionId } = parsed.data;

    const [judge, submission] = await Promise.all([
      prisma.judge.findUnique({ where: { id: judgeId }, include: { hackathon: true } }),
      prisma.hackathonSubmission.findUnique({ where: { id: submissionId }, include: { hackathon: true } }),
    ]);

    if (!judge || !submission) {
      return NextResponse.json({ message: "Judge or submission not found" }, { status: 404 });
    }

    if (judge.hackathonId !== submission.hackathonId) {
      return NextResponse.json({ message: "Judge and submission must belong to the same hackathon" }, { status: 400 });
    }

    const existing = await prisma.judgeAssignment.findUnique({
      where: { judgeId_submissionId: { judgeId, submissionId } },
    });
    if (existing) {
      return NextResponse.json({ message: "Already assigned" }, { status: 409 });
    }

    const assignment = await prisma.judgeAssignment.create({
      data: { judgeId, submissionId, hackathonId: judge.hackathonId },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Assign judge error:", error);
    return NextResponse.json({ message: "Failed to assign judge" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.view");

    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get("hackathonId");
    if (!hackathonId) {
      return NextResponse.json({ message: "hackathonId required" }, { status: 400 });
    }

    const assignments = await prisma.judgeAssignment.findMany({
      where: { hackathonId },
      include: {
        judge: { include: { user: { select: { id: true, name: true, email: true } } } },
        submission: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Fetch assignments error:", error);
    return NextResponse.json({ message: "Failed to fetch assignments" }, { status: 500 });
  }
}
