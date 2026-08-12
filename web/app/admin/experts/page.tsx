import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

export default async function AdminExpertsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  await checkPagePermission("expert.view");

  const status = searchParams?.status;
  const experts = await prisma.expertProfile.findMany({
    where: status ? { verificationStatus: status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      verifications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const filters = ["all", "UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "REJECTED"];

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
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <Eyebrow>Experts</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-6">Expert applications</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/admin/experts" : `/admin/experts?status=${f}`}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition ${
                  (status || "all") === f
                    ? "bg-orangeDeep text-white border-orangeDeep"
                    : "bg-white text-charcoal border-charcoal/8 hover:border-orange/40"
                }`}
              >
                {f === "all" ? "All" : f.replace("_", " ")}
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Expert</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Headline</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Submitted</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {experts.map((expert) => (
                  <tr key={expert.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-charcoal">{expert.user.name}</div>
                      <div className="text-xs text-inkSoft">{expert.user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-inkSoft">{expert.headline}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${badgeClass(expert.verificationStatus)}`}>
                        {expert.verificationStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-inkSoft">
                      {expert.verifications[0]?.createdAt.toLocaleDateString("en-IN") || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/experts/${expert.id}`} className="text-xs font-semibold text-orange hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
                {experts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-inkSoft">
                      No experts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
