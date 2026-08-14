import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import ToggleService from "../_components/ToggleService";

export default async function AdminMarketplaceServicesPage() {
  await checkPagePermission("dashboard.view");

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      expertProfile: { include: { user: { select: { name: true } } } },
    },
    take: 100,
  });

  return (
    <>
      <AdminHeader
        eyebrow="Marketplace"
        title="Services"
        description="Manage all services listed on the marketplace."
        backHref="/admin/marketplace"
      />

      <AdminDataTable
        title="All services"
        count={services.length}
        empty={
          services.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No services found.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-5 py-3 font-semibold text-charcoal">Name</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Type</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Price</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-cream/50 transition">
                <td className="px-5 py-4 font-semibold text-charcoal">{service.name}</td>
                <td className="px-5 py-4 text-inkSoft">{service.expertProfile.user.name}</td>
                <td className="px-5 py-4 text-inkSoft">{service.type}</td>
                <td className="px-5 py-4 text-inkSoft">₹{(service.price / 100).toFixed(2)}</td>
                <td className="px-5 py-4">
                  <ToggleService serviceId={service.id} initialIsActive={service.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
