import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminMarketplaceDmsPage() {
  await checkPagePermission("dashboard.view");

  const dms = await prisma.priorityDM.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { name: true, email: true } },
      expert: { select: { name: true, email: true } },
    },
    take: 100,
  });

  return (
    <>
      <AdminHeader
        eyebrow="Marketplace"
        title="Priority DMs"
        description="All priority DM requests sorted by most recent."
        backHref="/admin/marketplace"
      />

      <AdminDataTable
        title="All priority DMs"
        count={dms.length}
        empty={
          dms.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No priority DMs found.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-5 py-3 font-semibold text-charcoal">Title</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Student</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Amount</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {dms.map((dm) => (
              <tr key={dm.id} className="hover:bg-cream/50 transition">
                <td className="px-5 py-4 font-semibold text-charcoal">
                  <Link href={`/priority-dms/${dm.id}`} className="hover:text-orangeDeep transition">
                    {dm.title}
                  </Link>
                </td>
                <td className="px-5 py-4 text-inkSoft">{dm.expert.name}</td>
                <td className="px-5 py-4 text-inkSoft">{dm.student.name}</td>
                <td className="px-5 py-4 text-inkSoft">₹{(dm.amount / 100).toFixed(2)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={dm.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
