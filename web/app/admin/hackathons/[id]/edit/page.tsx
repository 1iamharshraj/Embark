import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import HackathonForm from "../../_components/HackathonForm";

export default async function EditHackathonPage({ params }: { params: { id: string } }) {
  await checkPagePermission("hackathon.update");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: params.id },
    include: { timelines: { orderBy: { startsAt: "asc" } } },
  });

  if (!hackathon) notFound();

  return (
    <>
      <AdminHeader
        eyebrow="Edit hackathon"
        title={hackathon.title}
        backHref="/admin/hackathons"
        backLabel="Back to hackathons"
      />
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
          eligibility: (hackathon.eligibility ?? {}) as Record<string, unknown>,
          rules: (hackathon.rules ?? {}) as Record<string, unknown>,
          problemStatement: (hackathon.problemStatement ?? {}) as Record<string, unknown>,
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
    </>
  );
}
