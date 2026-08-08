import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        include: {
          user: { select: { id: true, name: true, email: true, college: true } },
          submissions: true,
          advancements: true,
        },
      },
      submissions: {
        include: {
          registration: { select: { teamName: true } },
          user: { select: { name: true, email: true } },
        },
      },
      advancements: true,
      winners: true,
      _count: { select: { registrations: true } },
    },
  });

  if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ competition });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const competition = await prisma.competition.findUnique({ where: { id: params.id } });
  if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let updates: Record<string, unknown>;
  try {
    updates = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const dateFields = ["regOpen", "regClose", "startAt", "endAt", "resultAt"];
  for (const field of dateFields) {
    if (updates[field]) {
      updates[field] = new Date(updates[field] as string);
    }
  }

  if (updates.rounds) {
    updates.rounds = updates.rounds as object;
  }

  const updated = await prisma.competition.update({
    where: { id: params.id },
    data: updates,
  });

  return NextResponse.json({ competition: updated });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const competition = await prisma.competition.findUnique({ where: { id: params.id } });
  if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.competition.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
