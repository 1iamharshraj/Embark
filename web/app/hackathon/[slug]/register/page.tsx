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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true },
  });

  const settings = (hackathon.settings as Record<string, unknown> | undefined) ?? {};
  const customFields = Array.isArray(settings.registrationFields)
    ? settings.registrationFields
        .filter(
          (f): f is { name: string; label: string; type: string; required: boolean; options?: string[] } =>
            typeof f === "object" && f !== null && typeof (f as Record<string, unknown>).name === "string"
        )
        .map((f) => ({
          name: f.name,
          label: f.label,
          type: f.type as "text" | "textarea" | "number" | "select" | "checkbox" | "url",
          required: f.required,
          options: f.options,
        }))
    : [];

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
              customFields,
            }}
            existing={!!existing}
            defaults={{
              name: user?.name || "",
              email: user?.email || "",
              phone: user?.phone || "",
              college: user?.college || user?.studentProfile?.college || "",
              course: user?.studentProfile?.degree || "",
              year: user?.studentProfile?.graduationYear || null,
              specialization: user?.studentProfile?.specialization || "",
            }}
          />
        </div>
      </Container>
    </section>
  );
}
