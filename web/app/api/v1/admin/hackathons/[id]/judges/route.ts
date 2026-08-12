import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

const addSchema = z.object({
  email: z.string().email(),
  bio: z.string().optional(),
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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.view");

    const judges = await prisma.judge.findMany({
      where: { hackathonId: params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ judges });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Fetch judges error:", error);
    return NextResponse.json({ message: "Failed to fetch judges" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.update");

    const body = await request.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const hackathon = await prisma.hackathon.findUnique({ where: { id: params.id } });
    if (!hackathon) {
      return NextResponse.json({ message: "Hackathon not found" }, { status: 404 });
    }

    const targetUser = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existing = await prisma.judge.findUnique({
      where: { hackathonId_userId: { hackathonId: params.id, userId: targetUser.id } },
    });
    if (existing) {
      return NextResponse.json({ message: "User is already a judge" }, { status: 409 });
    }

    const judge = await prisma.judge.create({
      data: {
        hackathonId: params.id,
        userId: targetUser.id,
        bio: parsed.data.bio,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ judge }, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Add judge error:", error);
    return NextResponse.json({ message: "Failed to add judge" }, { status: 500 });
  }
}
