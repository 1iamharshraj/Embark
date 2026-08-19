import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { competitionStatus, parseRounds, parsePrizes, parseFaqs, parseContacts } from "@/lib/competition";
import CompetitionDetailClient from "./_components/CompetitionDetailClient";

export const dynamic = "force-dynamic";

export default async function CompetitionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [session, competition] = await Promise.all([
    getServerSession(authOptions),
    prisma.competition.findUnique({
      where: { id },
      include: {
        winners: {
          include: {
            registration: {
              select: { teamName: true, members: true },
            },
          },
        },
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  if (!competition || competition.draft) {
    notFound();
  }

  const rounds = parseRounds(competition.rounds);
  const prizes = parsePrizes(competition.prizes);
  const faqs = parseFaqs(competition.faqs);
  const contacts = parseContacts(competition.contacts);

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        college: (session.user as { college?: string }).college ?? "",
      }
    : null;

  let registration = null;
  if (user) {
    const reg = await prisma.registration.findFirst({
      where: { compId: id, userId: user.id },
      include: { submissions: true },
    });
    if (reg) {
      registration = {
        id: reg.id,
        teamName: reg.teamName,
        members: reg.members,
        submissions: reg.submissions.map((s) => ({
          id: s.id,
          roundIdx: s.roundIdx,
          link: s.link,
          filePath: s.filePath,
          note: s.note,
        })),
      };
    }
  }

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
        rules: (competition.rules as string[]) ?? [],
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
        eligibilityCriteria: (competition.eligibilityCriteria as string[]) ?? [],
        teamStructure: (competition.teamStructure as string[]) ?? [],
        institutes: (competition.institutes as string[]) ?? [],
        compStructure: (competition.compStructure as string[]) ?? [],
        submissionGuidelines: (competition.submissionGuidelines as string[]) ?? [],
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
      user={user}
      registration={registration}
    />
  );
}
