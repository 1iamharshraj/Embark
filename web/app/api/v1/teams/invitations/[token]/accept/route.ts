import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export async function POST(_request: Request, { params }: { params: { token: string } }) {
  try {
    const user = await requireAuth();

    let payload: { teamId: string; email: string };
    try {
      payload = jwt.verify(params.token, SECRET) as { teamId: string; email: string };
    } catch {
      return NextResponse.json({ message: "Invalid or expired invite" }, { status: 400 });
    }

    if (user.email.toLowerCase() !== payload.email.toLowerCase()) {
      return NextResponse.json({ message: "Invite email does not match your account" }, { status: 403 });
    }

    const team = await prisma.hackathonTeam.findUnique({
      where: { id: payload.teamId },
      include: { members: true },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const alreadyMember = team.members.find((m) => m.userId === user.id);
    if (alreadyMember) {
      return NextResponse.json({ member: alreadyMember });
    }

    const member = await prisma.hackathonTeamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: "MEMBER",
      },
    });

    return NextResponse.json({ member });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Accept invite error:", error);
    return NextResponse.json({ message: "Failed to accept invite" }, { status: 500 });
  }
}
