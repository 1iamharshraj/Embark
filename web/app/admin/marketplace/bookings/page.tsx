import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminMarketplaceBookingsPage() {
  await checkPagePermission("dashboard.view");

  const bookings = await prisma.booking.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      service: { select: { name: true } },
      client: { select: { name: true, email: true } },
      expert: { select: { name: true, email: true } },
    },
    take: 100,
  });

  return (
    <>
      <AdminHeader
        eyebrow="Marketplace"
        title="Bookings"
        description="All marketplace bookings sorted by schedule."
        backHref="/admin/marketplace"
      />

      <AdminDataTable
        title="All bookings"
        count={bookings.length}
        empty={
          bookings.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No bookings found.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-5 py-3 font-semibold text-charcoal">Service</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Student</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Scheduled</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Amount</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-cream/50 transition">
                <td className="px-5 py-4 font-semibold text-charcoal">
                  <Link href={`/bookings/${b.id}`} className="hover:text-orangeDeep transition">
                    {b.service.name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-inkSoft">{b.expert.name}</td>
                <td className="px-5 py-4 text-inkSoft">{b.client.name}</td>
                <td className="px-5 py-4 text-inkSoft">{new Date(b.scheduledAt).toLocaleString()}</td>
                <td className="px-5 py-4 text-inkSoft">₹{(b.amount / 100).toFixed(2)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
