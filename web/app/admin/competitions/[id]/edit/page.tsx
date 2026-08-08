import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import CompetitionForm from "../../_components/CompetitionForm";
import { parseRounds } from "@/lib/competition";

export default async function EditCompetitionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/account");

  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
  });

  if (!competition) notFound();

  const rounds = parseRounds(competition.rounds).map((r) => ({
    name: r.name,
    brief: r.brief || "",
    type: r.type || "",
    link: r.link || "",
    opens: r.opens || "",
    closes: r.closes || "",
  }));

  const initial = {
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
    prizes: competition.prizes,
    ppo: competition.ppo,
    beginner: competition.beginner,
    draft: competition.draft,
    regOpen: competition.regOpen.toISOString(),
    regClose: competition.regClose.toISOString(),
    startAt: competition.startAt.toISOString(),
    endAt: competition.endAt.toISOString(),
    resultAt: competition.resultAt?.toISOString() ?? null,
    rounds,
    eligibilityCriteria: competition.eligibilityCriteria,
    teamStructure: competition.teamStructure,
    institutes: competition.institutes,
    compStructure: competition.compStructure,
    submissionGuidelines: competition.submissionGuidelines,
    contacts: competition.contacts,
    aboutHost: competition.aboutHost,
    faqs: competition.faqs,
    viewBoost: competition.viewBoost,
    seedRegs: competition.seedRegs,
  };

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/competitions" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to competitions
          </Link>
          <Eyebrow>Edit competition</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">{competition.title}</h1>
          <CompetitionForm mode="edit" submitUrl={`/api/admin/competitions/${competition.id}`} initial={initial} />
        </div>
      </Container>
    </section>
  );
}
