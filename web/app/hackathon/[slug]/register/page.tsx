import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { registrationOpen } from "@/lib/hackathon";
import RegistrationForm from "./_components/RegistrationForm";

export default async function HackathonRegisterPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/hackathon/${params.slug}/register`);
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { slug: params.slug },
    include: { timelines: { orderBy: { startsAt: "asc" } } },
  });

  if (!hackathon) notFound();

  const existing = await prisma.hackathonRegistration.findUnique({
    where: { hackathonId_userId: { hackathonId: hackathon.id, userId: session.user.id } },
  });

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl mx-auto">
          <Eyebrow>Register</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Complete your registration for this hackathon.</p>
          <RegistrationForm
            hackathon={{
              id: hackathon.id,
              slug: hackathon.slug,
              title: hackathon.title,
              participationMode: hackathon.participationMode,
              teamMin: hackathon.teamMin,
              teamMax: hackathon.teamMax,
              fee: hackathon.fee,
              registrationOpen: registrationOpen(hackathon),
            }}
            existing={!!existing}
          />
        </div>
      </Container>
    </section>
  );
}
