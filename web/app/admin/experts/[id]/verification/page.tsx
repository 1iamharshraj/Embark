import Link from "next/link";
import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
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
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Link href={`/admin/experts/${params.id}`} className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to expert
          </Link>
          <Eyebrow>Verification review</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-2">{expert.user.name}</h1>
          <p className="text-inkSoft mb-8">Review submitted documents and approve or reject the application.</p>

          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 space-y-6 mb-6">
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
                    <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">LinkedIn</div>
                    <a href={verification.linkedInUrl} target="_blank" rel="noreferrer" className="text-sm text-orange hover:underline break-all">
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
          </div>

          <ReviewActions verificationId={verification.id} expertId={params.id} />
        </div>
      </Container>
    </section>
  );
}

function DocumentCard({ label, url }: { label: string; url: string }) {
  return (
    <div className="rounded-xl bg-cream p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-2">{label}</div>
      <a href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-orange hover:underline">
        View document
      </a>
    </div>
  );
}
