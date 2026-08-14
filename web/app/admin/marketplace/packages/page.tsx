import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
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
    <>
      <AdminHeader
        eyebrow="Marketplace"
        title="Packages"
        description="Manage all packages listed on the marketplace."
        backHref="/admin/marketplace"
      />

      <AdminDataTable
        title="All packages"
        count={packages.length}
        empty={
          packages.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No packages found.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-5 py-3 font-semibold text-charcoal">Name</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Price</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Validity</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-cream/50 transition">
                <td className="px-5 py-4 font-semibold text-charcoal">{pkg.name}</td>
                <td className="px-5 py-4 text-inkSoft">{pkg.expertProfile.user.name}</td>
                <td className="px-5 py-4 text-inkSoft">₹{(pkg.price / 100).toFixed(2)}</td>
                <td className="px-5 py-4 text-inkSoft">{pkg.validityDays} days</td>
                <td className="px-5 py-4">
                  <TogglePackage packageId={pkg.id} initialIsActive={pkg.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
