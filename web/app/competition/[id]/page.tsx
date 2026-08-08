import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import type { Metadata } from "next";
import CompetitionDetailClient from "./_components/CompetitionDetailClient";
import { competitionStatus, parseRounds, parsePrizes, parseFaqs, parseContacts } from "@/lib/competition";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
    select: { title: true, about: true },
  });
  return {
    title: competition ? `${competition.title} — Embark India` : "Competition — Embark India",
    description: competition?.about || "MBA case competition on Embark India.",
  };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
    include: {
      winners: {
        include: {
          registration: { select: { teamName: true, members: true } },
        },
      },
      _count: { select: { registrations: true } },
    },
  });

  if (!competition || competition.draft) {
    notFound();
  }

  const registration = session?.user?.id
    ? await prisma.registration.findUnique({
        where: { userId_compId: { userId: session.user.id, compId: params.id } },
        include: { submissions: { orderBy: { roundIdx: "asc" } } },
      })
    : null;

  const rounds = parseRounds(competition.rounds);
  const prizes = parsePrizes(competition.prizes);
  const faqs = parseFaqs(competition.faqs);
  const contacts = parseContacts(competition.contacts);

  return (
    <CompetitionDetailClient
      competition={{
        id: competition.id,
        title: competition.title,
        host: competition.host,
        category: competition.category,
        banner: competition.banner,
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
        registrationCount: (competition._count?.registrations ?? 0) + competition.seedRegs,
        winners: competition.winners.map((w) => ({
          rank: w.rank,
          teamName: w.teamName,
          members: w.registration.members,
        })),
      }}
      user={
        session?.user
          ? {
              id: session.user.id as string,
              name: session.user.name as string,
              email: session.user.email as string,
              college: (session.user as { college?: string }).college ?? "",
            }
          : null
      }
      registration={
        registration
          ? {
              id: registration.id,
              teamName: registration.teamName,
              members: registration.members,
              submissions: registration.submissions.map((s) => ({
                id: s.id,
                roundIdx: s.roundIdx,
                link: s.link,
                filePath: s.filePath,
                note: s.note,
              })),
            }
          : null
      }
    />
  );
}
