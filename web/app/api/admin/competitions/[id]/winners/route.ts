import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  winners: z.array(
    z.object({
      regId: z.string().min(1),
      rank: z.number().int().min(1),
      teamName: z.string().optional(),
    })
  ),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.update");

    const compId = params.id;
    const competition = await prisma.competition.findUnique({ where: { id: compId } });
    if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const registrations = await prisma.registration.findMany({
      where: { compId },
      select: { id: true, teamName: true },
    });
    const regMap = new Map(registrations.map((r) => [r.id, r.teamName]));

    await prisma.$transaction(async (tx) => {
      await tx.winner.deleteMany({ where: { compId } });
      for (const w of parsed.data.winners) {
        await tx.winner.create({
          data: {
            compId,
            regId: w.regId,
            rank: w.rank,
            teamName: w.teamName ?? regMap.get(w.regId) ?? "Team",
          },
        });
      }
    });

    const winners = await prisma.winner.findMany({ where: { compId }, orderBy: { rank: "asc" } });
    return NextResponse.json({ winners });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to save winners" }, { status: 500 });
  }
}
