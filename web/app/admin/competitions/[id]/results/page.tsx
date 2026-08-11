import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import ResultsPageClient from "./_components/ResultsPageClient";

export default async function ResultsPage({ params }: { params: { id: string } }) {
  await checkPagePermission("competition.view");

  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        include: {
          submissions: { orderBy: { roundIdx: "asc" } },
          advancements: true,
        },
      },
      winners: true,
    },
  });

  if (!competition) notFound();

  const rounds = Array.isArray(competition.rounds) ? competition.rounds : [];
  const lastRoundIndex = Math.max(0, rounds.length - 1);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <ResultsPageClient
          competition={competition}
          registrations={competition.registrations}
          lastRoundIndex={lastRoundIndex}
          winners={competition.winners}
        />
      </Container>
    </section>
  );
}
