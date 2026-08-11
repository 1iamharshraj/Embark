import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.view");

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
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch competition" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.update");

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
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update competition" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.delete");

    const competition = await prisma.competition.findUnique({ where: { id: params.id } });
    if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.competition.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete competition" }, { status: 500 });
  }
}
