import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  roundIdx: z.number().int().min(0),
  regIds: z.array(z.string().min(1)),
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

    const { roundIdx, regIds } = parsed.data;
    const advanceRoundIdx = roundIdx - 1;

    await prisma.$transaction(async (tx) => {
      for (const regId of regIds) {
        await tx.advancement.upsert({
          where: { compId_regId_roundIdx: { compId, regId, roundIdx: advanceRoundIdx } },
          create: { compId, regId, roundIdx: advanceRoundIdx },
          update: {},
        });
      }
    });

    return NextResponse.json({ ok: true, advancedToRound: roundIdx, advanceRoundIdx });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to advance teams" }, { status: 500 });
  }
}
