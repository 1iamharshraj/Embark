import Link from "next/link";
import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

export default async function AdminExpertDetailPage({ params }: { params: { id: string } }) {
  await checkPagePermission("expert.view");

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

  const badgeClass = (s: string) => {
    switch (s) {
      case "VERIFIED":
        return "bg-green-100 text-green-700";
      case "PENDING_VERIFICATION":
        return "bg-orangeSoft text-orangeDeep";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/experts" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to experts
          </Link>
          <Eyebrow>Expert review</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-2">{expert.user.name}</h1>
          <p className="text-inkSoft mb-6">{expert.user.email}</p>

          <div className="flex items-center gap-3 mb-8">
            <span className={`inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${badgeClass(expert.verificationStatus)}`}>
              {expert.verificationStatus.replace("_", " ")}
            </span>
            <Button href={`/admin/experts/${expert.id}/verification`} size="sm">
              Review verification
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 space-y-6 mb-6">
            <div>
              <h2 className="font-display font-bold text-lg text-charcoal mb-2">Headline</h2>
              <p className="text-inkSoft">{expert.headline}</p>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-charcoal mb-2">Bio</h2>
              <p className="text-inkSoft whitespace-pre-line">{expert.bio}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Education</h3>
                <p className="text-inkSoft">{expert.bSchool || "—"}</p>
                <p className="text-inkSoft">{expert.degree} {expert.specialization && `· ${expert.specialization}`}</p>
                {expert.graduationYear && <p className="text-inkSoft">Class of {expert.graduationYear}</p>}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Experience</h3>
                <p className="text-inkSoft">{expert.currentRole || "—"}</p>
                <p className="text-inkSoft">{expert.currentCompany}</p>
                {expert.yearsExperience && <p className="text-inkSoft">{expert.yearsExperience} years</p>}
              </div>
            </div>
            {expert.expertise.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-charcoal mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.expertise.map((item) => (
                    <span key={item} className="text-xs bg-cream text-inkSoft rounded-full px-2 py-1 border border-charcoal/8">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
            <h2 className="font-display font-bold text-lg text-charcoal mb-4">Verification history</h2>
            {expert.verifications.length === 0 ? (
              <p className="text-inkSoft">No verification requests yet.</p>
            ) : (
              <div className="space-y-3">
                {expert.verifications.map((v) => (
                  <div key={v.id} className="rounded-xl bg-cream p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${badgeClass(v.status)}`}>
                        {v.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-inkSoft">{v.createdAt.toLocaleDateString("en-IN")}</span>
                    </div>
                    {v.adminNote && <p className="text-sm text-inkSoft mt-2">{v.adminNote}</p>}
                    {v.status === "PENDING_VERIFICATION" && (
                      <Link href={`/admin/experts/${expert.id}/verification?verificationId=${v.id}`} className="text-sm font-semibold text-orange hover:underline mt-2 inline-block">
                        Review
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
