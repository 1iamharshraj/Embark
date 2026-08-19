import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

const removeSchema = z.object({
  userId: z.string().min(1),
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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = removeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    const team = await prisma.hackathonTeam.findUnique({
      where: { id: params.id },
      include: {
        hackathon: { select: { id: true, title: true, slug: true, teamMin: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    if (team.leaderId !== user.id && !user.isAdmin) {
      return NextResponse.json({ message: "Only the team leader can remove members" }, { status: 403 });
    }

    if (userId === team.leaderId) {
      return NextResponse.json({ message: "Team leader cannot be removed" }, { status: 400 });
    }

    const submission = await prisma.hackathonSubmission.findFirst({
      where: { teamId: team.id },
      select: { status: true },
    });
    const lockedStatuses = ["LOCKED", "UNDER_EVALUATION", "EVALUATED", "SHORTLISTED", "WINNER", "REJECTED"];
    if (submission && lockedStatuses.includes(submission.status)) {
      return NextResponse.json({ message: "Team is locked after submission" }, { status: 400 });
    }

    const minSize = team.hackathon.teamMin || 1;
    if (team.members.length <= minSize) {
      return NextResponse.json(
        { message: `Team must have at least ${minSize} member(s)` },
        { status: 400 }
      );
    }

    const member = team.members.find((m) => m.userId === userId);
    if (!member) {
      return NextResponse.json({ message: "Member not found in team" }, { status: 404 });
    }

    await prisma.hackathonTeamMember.delete({
      where: { teamId_userId: { teamId: team.id, userId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Remove team member error:", error);
    return NextResponse.json({ message: "Failed to remove member" }, { status: 500 });
  }
}
