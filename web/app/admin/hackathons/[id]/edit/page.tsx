import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import HackathonForm from "../../_components/HackathonForm";

export default async function EditHackathonPage({ params }: { params: { id: string } }) {
  await checkPagePermission("hackathon.update");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: params.id },
    include: { timelines: { orderBy: { startsAt: "asc" } } },
  });

  if (!hackathon) notFound();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Button href="/admin/hackathons" variant="ghost" size="sm">
            ← Back to hackathons
          </Button>
          <Eyebrow className="mt-4">Edit hackathon</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-6">{hackathon.title}</h1>
          <HackathonForm
            mode="edit"
            submitUrl={`/api/v1/admin/hackathons/${hackathon.id}`}
            initial={{
              ...hackathon,
              subtitle: hackathon.subtitle ?? "",
              banner: hackathon.banner ?? "orange",
              bannerUrl: hackathon.bannerUrl ?? "",
              logoUrl: hackathon.logoUrl ?? "",
              shortDescription: hackathon.shortDescription ?? "",
              detailedDescription: hackathon.detailedDescription ?? "",
              organizer: hackathon.organizer ?? "",
              category: hackathon.category ?? "",
              tags: hackathon.tags.join(", "),
              eligibility: JSON.stringify(hackathon.eligibility ?? {}, null, 2),
              rules: JSON.stringify(hackathon.rules ?? {}, null, 2),
              problemStatement: JSON.stringify(hackathon.problemStatement ?? {}, null, 2),
              evaluationCriteria: JSON.stringify(hackathon.evaluationCriteria ?? {}, null, 2),
              resources: JSON.stringify(hackathon.resources ?? {}, null, 2),
              faqs: JSON.stringify(hackathon.faqs ?? {}, null, 2),
              settings: JSON.stringify(hackathon.settings ?? {}, null, 2),
              timelines: hackathon.timelines.map((t) => ({
                ...t,
                startsAt: t.startsAt.toISOString(),
                endsAt: t.endsAt?.toISOString() ?? null,
              })),
            }}
          />
        </div>
      </Container>
    </section>
  );
}
