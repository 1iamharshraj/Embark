import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/Button";

export default async function AdminOrdersPage() {
  await checkPagePermission("order.view");

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true, name: true } },
      playbook: { select: { name: true, slug: true } },
      bookingRequest: { include: { mentor: { select: { name: true, slug: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        eyebrow="Payments"
        title="Orders"
        description="All playbook and mentorship orders across the platform."
        actions={<Button href="/admin/payments/transactions">View transactions</Button>}
      />

      <AdminDataTable
        title="All orders"
        description="Showing every order with status, amount and related item."
        count={orders.length}
        empty={
          orders.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No orders yet.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-6 py-4 font-semibold text-charcoal">User</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Type</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Item</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Amount</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Status</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Payment ID</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {orders.map((order) => {
              const item =
                order.type === "mentorship" && order.bookingRequest
                  ? {
                      label: `Mentorship — ${order.bookingRequest.mentor.name}`,
                      href: `/admin/mentorship`,
                    }
                  : order.playbook
                  ? {
                      label: order.playbook.name,
                      href: `/playbook/${order.playbook.slug}`,
                    }
                  : { label: "—", href: "" };

              return (
                <tr key={order.id} className="hover:bg-cream/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-charcoal">{order.user.name}</div>
                    <div className="text-xs text-inkSoft">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 capitalize">{order.type}</td>
                  <td className="px-6 py-4">
                    {item.href ? (
                      <Link href={item.href} className="font-semibold text-charcoal hover:text-orangeDeep transition">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-inkSoft">{item.label}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">₹{order.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-inkSoft">{order.paymentId || "—"}</td>
                  <td className="px-6 py-4 text-inkSoft">{order.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
