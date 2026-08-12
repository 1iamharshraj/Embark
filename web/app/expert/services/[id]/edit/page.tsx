import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ServiceForm from "../../_components/ServiceForm";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    include: { expertProfile: { select: { id: true, userId: true } } },
  });

  if (!service) notFound();

  if (!session.user.isAdmin && service.expertProfile.userId !== session.user.id) {
    redirect("/account");
  }

  const initial = {
    id: service.id,
    type: service.type,
    name: service.name,
    description: service.description || undefined,
    category: service.category || undefined,
    durationMinutes: service.durationMinutes || undefined,
    price: service.price,
    bufferMinutes: service.bufferMinutes,
    cancellationPolicy: service.cancellationPolicy || undefined,
    intakeQuestions: Array.isArray(service.intakeQuestions)
      ? (service.intakeQuestions as string[])
      : [],
    meetingMethod: service.meetingMethod || undefined,
    isActive: service.isActive,
  };

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Marketplace</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            Edit service
          </h1>
          <p className="text-inkSoft mb-8">Update your service details.</p>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <ServiceForm expertProfileId={service.expertProfile.id} initial={initial} />
          </div>
        </div>
      </Container>
    </section>
  );
}
