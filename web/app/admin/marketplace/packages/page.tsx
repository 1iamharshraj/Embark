import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import TogglePackage from "../_components/TogglePackage";

export default async function AdminMarketplacePackagesPage() {
  await checkPagePermission("dashboard.view");

  const packages = await prisma.package.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      expertProfile: { include: { user: { select: { name: true } } } },
      items: { include: { service: { select: { name: true } } } },
    },
    take: 100,
  });

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/admin/marketplace" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to marketplace
          </Link>
          <Eyebrow>Marketplace</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Packages</h1>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Name</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Expert</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Price</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Validity</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4 font-semibold text-charcoal">{pkg.name}</td>
                    <td className="px-5 py-4 text-inkSoft">{pkg.expertProfile.user.name}</td>
                    <td className="px-5 py-4 text-inkSoft">₹{(pkg.price / 100).toFixed(2)}</td>
                    <td className="px-5 py-4 text-inkSoft">{pkg.validityDays} days</td>
                    <td className="px-5 py-4">
                      <TogglePackage packageId={pkg.id} initialIsActive={pkg.isActive} />
                    </td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-inkSoft">
                      No packages found.
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
