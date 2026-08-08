import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { competitionStatus, parseRounds, parsePrizes, parseFaqs, parseContacts } from "@/lib/competition";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      winners: {
        include: {
          registration: {
            select: { teamName: true, members: true },
          },
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!competition || competition.draft) {
    return NextResponse.json({ error: "Competition not found" }, { status: 404 });
  }

  const rounds = parseRounds(competition.rounds);
  const prizes = parsePrizes(competition.prizes);
  const faqs = parseFaqs(competition.faqs);
  const contacts = parseContacts(competition.contacts);

  return NextResponse.json({
    competition: {
      id: competition.id,
      title: competition.title,
      host: competition.host,
      category: competition.category,
      banner: competition.banner,
      banners: competition.banners,
      fee: competition.fee,
      teamMin: competition.teamMin,
      teamMax: competition.teamMax,
      eligibility: competition.eligibility,
      about: competition.about,
      rules: competition.rules,
      prizes,
      ppo: competition.ppo,
      beginner: competition.beginner,
      regOpen: competition.regOpen.toISOString(),
      regClose: competition.regClose.toISOString(),
      startAt: competition.startAt.toISOString(),
      endAt: competition.endAt.toISOString(),
      resultAt: competition.resultAt?.toISOString() ?? null,
      status: competitionStatus(competition),
      rounds,
      eligibilityCriteria: competition.eligibilityCriteria,
      teamStructure: competition.teamStructure,
      institutes: competition.institutes,
      compStructure: competition.compStructure,
      submissionGuidelines: competition.submissionGuidelines,
      contacts,
      aboutHost: competition.aboutHost,
      faqs,
      viewBoost: competition.viewBoost,
      views: competition.views,
      seedRegs: competition.seedRegs,
      registrationCount: (competition._count?.registrations ?? 0) + competition.seedRegs,
      winners: competition.winners.map((w) => ({
        rank: w.rank,
        teamName: w.teamName,
        members: w.registration.members,
      })),
    },
  });
}
