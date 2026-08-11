import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";
import { refreshUserPermissions } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const refreshToken = body.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    const { roles, permissions } = await refreshUserPermissions(tokenRecord.user.id);

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const accessToken = sign(
      {
        sub: tokenRecord.user.id,
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        name: tokenRecord.user.name,
        college: tokenRecord.user.college,
        isAdmin: tokenRecord.user.isAdmin,
        roles,
        permissions,
      },
      secret,
      { expiresIn: "15m" }
    );

    return NextResponse.json({
      accessToken,
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        name: tokenRecord.user.name,
        roles,
        permissions,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
