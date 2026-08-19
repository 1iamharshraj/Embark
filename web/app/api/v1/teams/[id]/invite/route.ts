import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { sendEmailQueue } from "@/lib/notifications";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;

    const team = await prisma.hackathonTeam.findUnique({
      where: { id: params.id },
      include: { hackathon: { select: { title: true, slug: true, teamMax: true } }, members: { include: { user: { select: { email: true } } } } },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    if (team.leaderId !== user.id && !user.isAdmin) {
      return NextResponse.json({ message: "Only the team leader can invite" }, { status: 403 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = team.members.find((m) => m.user?.email === normalizedEmail);
    if (existing) {
      return NextResponse.json({ message: "User is already a team member" }, { status: 409 });
    }

    const teamMax = team.hackathon.teamMax || 4;
    if (team.members.length >= teamMax) {
      return NextResponse.json(
        { message: `Team is full (max ${teamMax} members)` },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { teamId: team.id, email: normalizedEmail, name: name || "" },
      SECRET,
      { expiresIn: "7d" }
    );

    const inviteUrl = `${process.env.NEXTAUTH_URL || ""}/teams/invite/${token}`;

    await sendEmailQueue({
      to: normalizedEmail,
      subject: `Team invitation — ${team.hackathon.title}`,
      html: `<p>Hi ${escapeHtml(name || "there")},</p><p>You have been invited to join team <strong>${escapeHtml(
        team.name
      )}</strong> for <strong>${escapeHtml(team.hackathon.title)}</strong>.</p><p><a href="${inviteUrl}">Accept invitation</a></p><p>— Embark India</p>`,
      text: `Hi ${name || "there"},\n\nYou have been invited to join team ${team.name} for ${team.hackathon.title}.\n\nAccept: ${inviteUrl}\n\n— Embark India`,
    });

    return NextResponse.json({ token, inviteUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Team invite error:", error);
    return NextResponse.json({ message: "Failed to send invite" }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
