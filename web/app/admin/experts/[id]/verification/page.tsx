import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { ReviewActions } from "./_components/ReviewActions";

export default async function AdminExpertVerificationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { verificationId?: string };
}) {
  await checkPagePermission("expert.verify");

  const expert = await prisma.expertProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      verifications: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!expert) notFound();

  const verification =
    searchParams?.verificationId && searchParams.verificationId !== "latest"
      ? expert.verifications.find((v) => v.id === searchParams.verificationId)
      : expert.verifications[0];

  if (!verification) notFound();

  return (
    <>
      <AdminHeader
        eyebrow="Verification review"
        title={expert.user.name}
        description="Review submitted documents and approve or reject the application."
        backHref={`/admin/experts/${params.id}`}
        backLabel="Back to expert"
      />

      <AdminCard className="p-6 space-y-6 mb-6">
        <div>
          <h2 className="font-display font-bold text-lg text-charcoal mb-3">Documents</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {verification.educationProof && (
              <DocumentCard label="Education proof" url={verification.educationProof} />
            )}
            {verification.employmentProof && (
              <DocumentCard label="Employment proof" url={verification.employmentProof} />
            )}
            {verification.resumeUrl && (
              <DocumentCard label="Resume / CV" url={verification.resumeUrl} />
            )}
            {verification.linkedInUrl && (
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">
                  LinkedIn
                </div>
                <a
                  href={verification.linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-orange hover:underline break-all"
                >
                  {verification.linkedInUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        {verification.supportingDocs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-charcoal mb-2">Supporting documents</h3>
            <div className="flex flex-wrap gap-2">
              {verification.supportingDocs.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-orange hover:underline"
                >
                  Document {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </AdminCard>

      <ReviewActions verificationId={verification.id} expertId={params.id} />
    </>
  );
}

function DocumentCard({ label, url }: { label: string; url: string }) {
  return (
    <div className="rounded-xl bg-cream p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-2">{label}</div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-orange hover:underline"
      >
        View document
      </a>
    </div>
  );
}
