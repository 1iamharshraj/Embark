import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import PriorityDmForm from "./_components/PriorityDmForm";

export default async function PriorityDmPage({ params }: { params: { expertId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: params.expertId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      services: {
        where: { type: "PRIORITY_DM", status: "PUBLISHED" },
        orderBy: { price: "asc" },
      },
    },
  });

  if (!expertProfile) notFound();

  const dmService = expertProfile.services[0];
  if (!dmService) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Eyebrow>Priority DM</Eyebrow>
            <h1 className="font-display font-bold text-3xl text-charcoal mb-4">
              {expertProfile.user.name} is not accepting priority DMs
            </h1>
            <p className="text-inkSoft">Check back later or book a 1:1 session instead.</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Priority DM</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            Ask {expertProfile.user.name}
          </h1>
          <p className="text-inkSoft mb-8">
            Submit a detailed question and get a written response.
          </p>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <PriorityDmForm
              expertId={params.expertId}
              price={dmService.price}
              responseSlaHours={dmService.responseSlaHours}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
