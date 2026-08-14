import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import CompetitionForm from "../../_components/CompetitionForm";
import { parseRounds } from "@/lib/competition";

export default async function EditCompetitionPage({ params }: { params: { id: string } }) {
  await checkPagePermission("competition.update");

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
    <div className="max-w-4xl mx-auto">
      <AdminHeader
        eyebrow="Edit competition"
        title={competition.title}
        description="Update details, rounds and publishing status."
        backHref="/admin/competitions"
      />
      <CompetitionForm mode="edit" submitUrl={`/api/admin/competitions/${competition.id}`} initial={initial} />
    </div>
  );
}
