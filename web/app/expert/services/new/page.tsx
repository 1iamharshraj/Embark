import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ServiceForm from "../_components/ServiceForm";

export default async function NewServicePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Marketplace</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            New service
          </h1>
          <p className="text-inkSoft mb-8">
            Define what you offer, how long it takes, and how much it costs.
          </p>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <ServiceForm expertProfileId={expertProfile.id} />
          </div>
        </div>
      </Container>
    </section>
  );
}
