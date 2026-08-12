import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { certificateQueue } from "@/lib/queue";
import { createAuditLog } from "@/lib/audit";

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

function getAward(rank: number): string | null {
  if (rank === 1) return "WINNER";
  if (rank === 2) return "RUNNER_UP";
  if (rank <= 5) return "FINALIST";
  return null;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.update");

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        submissions: {
          include: {
            evaluations: { where: { finalizedAt: { not: null } }, select: { score: true } },
            team: { include: { members: { include: { user: { select: { id: true } } } }, leader: { select: { id: true } } } },
          },
        },
        registrations: { select: { userId: true } },
      },
    });

    if (!hackathon) {
      return NextResponse.json({ message: "Hackathon not found" }, { status: 404 });
    }

    const scoredSubmissions = hackathon.submissions
      .map((sub) => {
        const finalized = sub.evaluations.filter((e) => e.score !== null);
        const average =
          finalized.length > 0
            ? finalized.reduce((sum, e) => sum + (e.score || 0), 0) / finalized.length
            : 0;
        return { ...sub, averageScore: Math.round(average * 100) / 100, hasFinalized: finalized.length > 0 };
      })
      .filter((sub) => sub.hasFinalized)
      .sort((a, b) => b.averageScore - a.averageScore);

    if (scoredSubmissions.length === 0) {
      return NextResponse.json({ message: "No finalized evaluations to publish results" }, { status: 400 });
    }

    const ranked = scoredSubmissions.map((sub, index) => ({ ...sub, rank: index + 1, award: getAward(index + 1) }));

    const results = await prisma.$transaction(async (tx) => {
      await tx.hackathonResult.deleteMany({ where: { hackathonId: hackathon.id } });

      const created = await tx.hackathonResult.createMany({
        data: ranked.map((sub) => ({
          hackathonId: hackathon.id,
          submissionId: sub.id,
          rank: sub.rank,
          score: sub.averageScore,
          award: sub.award,
          publishedAt: new Date(),
        })),
      });

      await tx.hackathon.update({
        where: { id: hackathon.id },
        data: { status: "RESULTS_PUBLISHED" },
      });

      return created;
    });

    await createAuditLog({
      userId: user.id,
      action: "hackathon.results.publish",
      resource: "hackathon",
      resourceId: hackathon.id,
      oldValue: { status: hackathon.status },
      newValue: { status: "RESULTS_PUBLISHED", results: results.count },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Enqueue achievement certificates for ranked team members.
    for (const sub of ranked) {
      const memberIds = new Set<string>();
      if (sub.team?.leaderId) memberIds.add(sub.team.leaderId);
      sub.team?.members.forEach((m) => memberIds.add(m.userId));
      for (const memberId of Array.from(memberIds)) {
        await certificateQueue.add("generate", {
          userId: memberId,
          hackathonId: hackathon.id,
          type: sub.award || "PARTICIPATION",
          baseUrl,
        });
      }
    }

    // Enqueue participation certificates for all registered users.
    for (const reg of hackathon.registrations) {
      await certificateQueue.add("generate", {
        userId: reg.userId,
        hackathonId: hackathon.id,
        type: "PARTICIPATION",
        baseUrl,
      });
    }

    return NextResponse.json({ results: results.count, ranked });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Publish results error:", error);
    return NextResponse.json({ message: "Failed to publish results" }, { status: 500 });
  }
}
