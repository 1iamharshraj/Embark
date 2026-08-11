import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { competitionStatus } from "@/lib/competition";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = await prisma.competition.findMany({
    where: { draft: false },
    orderBy: { startAt: "asc" },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  const competitions = raw.map((c) => ({
    id: c.id,
    title: c.title,
    host: c.host,
    category: c.category,
    banner: c.banner,
    fee: c.fee,
    teamMin: c.teamMin,
    teamMax: c.teamMax,
    eligibility: c.eligibility,
    regOpen: c.regOpen.toISOString(),
    regClose: c.regClose.toISOString(),
    startAt: c.startAt.toISOString(),
    endAt: c.endAt.toISOString(),
    resultAt: c.resultAt?.toISOString() ?? null,
    status: competitionStatus(c),
    registrationCount: (c._count?.registrations ?? 0) + c.seedRegs,
    seedRegs: c.seedRegs,
    beginner: c.beginner,
    ppo: c.ppo,
  }));

  return NextResponse.json({ competitions });
}
