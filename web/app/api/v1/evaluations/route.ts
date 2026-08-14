import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { calculateWeightedScore, calculateAverageScore } from "@/lib/evaluation";

const scoreSchema = z.object({
  criterionName: z.string().min(1),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).default(1),
  comment: z.string().optional(),
});

const evaluationSchema = z.object({
  submissionId: z.string().min(1),
  scores: z.array(scoreSchema).min(1),
  comment: z.string().optional(),
  finalized: z.boolean().default(false),
});

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}


export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = evaluationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { submissionId, scores, comment, finalized } = parsed.data;

    const submission = await prisma.hackathonSubmission.findUnique({
      where: { id: submissionId },
      include: { hackathon: true, team: { select: { name: true } } },
    });

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    const judge = await prisma.judge.findUnique({
      where: { hackathonId_userId: { hackathonId: submission.hackathonId, userId: user.id } },
    });

    if (!judge && !user.isAdmin) {
      return NextResponse.json({ message: "You are not a judge for this hackathon" }, { status: 403 });
    }

    const assignment = judge
      ? await prisma.judgeAssignment.findUnique({
          where: { judgeId_submissionId: { judgeId: judge.id, submissionId } },
        })
      : null;

    if (!assignment && !user.isAdmin && judge) {
      return NextResponse.json({ message: "This submission is not assigned to you" }, { status: 403 });
    }

    const existing = await prisma.evaluation.findUnique({
      where: { submissionId_judgeId: { submissionId, judgeId: judge?.id || user.id } },
    });

    if (existing?.finalizedAt && !user.isAdmin) {
      return NextResponse.json({ message: "Evaluation is finalized and cannot be updated" }, { status: 400 });
    }

    const weightedScore = calculateWeightedScore(scores);
    const judgeId = judge?.id || user.id;

    const evaluation = await prisma.$transaction(async (tx) => {
      const ev = await tx.evaluation.upsert({
        where: { submissionId_judgeId: { submissionId, judgeId } },
        create: {
          hackathonId: submission.hackathonId,
          submissionId,
          judgeId,
          score: weightedScore,
          comment,
          finalizedAt: finalized ? new Date() : null,
        },
        update: {
          score: weightedScore,
          comment,
          finalizedAt: finalized ? new Date() : null,
        },
      });

      await tx.evaluationScore.deleteMany({ where: { evaluationId: ev.id } });
      await tx.evaluationScore.createMany({
        data: scores.map((s) => ({
          evaluationId: ev.id,
          criterionName: s.criterionName,
          weight: s.weight,
          score: s.score,
          comment: s.comment || "",
        })),
      });

      if (finalized) {
        const allEvaluations = await tx.evaluation.findMany({
          where: { submissionId },
          select: { score: true },
        });
        const averageScore = calculateAverageScore(allEvaluations.map((e) => e.score));
        await tx.hackathonSubmission.update({
          where: { id: submissionId },
          data: { score: averageScore },
        });
      }

      return ev;
    });

    return NextResponse.json({ evaluation });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Evaluation error:", error);
    return NextResponse.json({ message: "Failed to save evaluation" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("submissionId");
    const hackathonId = searchParams.get("hackathonId");

    if (!submissionId && !hackathonId) {
      return NextResponse.json({ message: "submissionId or hackathonId required" }, { status: 400 });
    }

    const where: { submissionId?: string; hackathonId?: string; judgeId?: string } = {};
    if (submissionId) where.submissionId = submissionId;
    if (hackathonId) where.hackathonId = hackathonId;

    if (!user.isAdmin) {
      const judge = await prisma.judge.findFirst({
        where: { userId: user.id },
      });
      if (judge) where.judgeId = judge.id;
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: { scores: true, judge: { include: { user: { select: { name: true } } } }, submission: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ evaluations });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Fetch evaluations error:", error);
    return NextResponse.json({ message: "Failed to fetch evaluations" }, { status: 500 });
  }
}
