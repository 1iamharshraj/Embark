import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import ProgressPageClient from "./_components/ProgressPageClient";

export default async function ProgressPage({ params }: { params: { id: string } }) {
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
    },
  });

  if (!competition) notFound();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <ProgressPageClient competition={competition} registrations={competition.registrations} />
      </Container>
    </section>
  );
}
