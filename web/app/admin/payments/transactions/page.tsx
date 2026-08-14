import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminTransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  await checkPagePermission("dashboard.view");

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      payment: true,
      refund: true,
      commission: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <AdminHeader
        eyebrow="Payments"
        title="Transactions"
        description="All platform transactions and related commission splits."
        backHref="/admin"
      />

      <AdminDataTable
        title="All transactions"
        count={orders.length}
        empty={
          orders.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No transactions yet.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-5 py-3 font-semibold text-charcoal">Order</th>
              <th className="px-5 py-3 font-semibold text-charcoal">User</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Type</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Amount</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Commission</th>
              <th className="px-5 py-3 font-semibold text-charcoal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-cream/50 transition">
                <td className="px-5 py-4 font-semibold text-charcoal">{order.id.slice(0, 8)}</td>
                <td className="px-5 py-4 text-inkSoft">{order.user.name}</td>
                <td className="px-5 py-4 text-inkSoft">{order.orderType}</td>
                <td className="px-5 py-4 text-inkSoft">₹{(order.amount / 100).toFixed(2)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-4 text-inkSoft">
                  {order.commission
                    ? `₹${(order.commission.platformAmount / 100).toFixed(2)} / ₹${(
                        order.commission.expertAmount / 100
                      ).toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-5 py-4">
                  {order.status === "paid" && !order.refund && (
                    <Link
                      href={`/admin/payments/refunds?orderId=${order.id}`}
                      className="text-orangeDeep hover:underline font-semibold"
                    >
                      Refund
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
