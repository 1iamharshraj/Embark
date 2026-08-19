import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

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

    const member = team.members.find((m) => m.userId === user.id);
    if (!member) {
      return NextResponse.json({ message: "You are not a member of this team" }, { status: 403 });
    }

    if (team.leaderId === user.id) {
      return NextResponse.json({ message: "Team leader cannot leave. Transfer leadership or delete the team." }, { status: 400 });
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

    await prisma.hackathonTeamMember.delete({
      where: { teamId_userId: { teamId: team.id, userId: user.id } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Leave team error:", error);
    return NextResponse.json({ message: "Failed to leave team" }, { status: 500 });
  }
}
