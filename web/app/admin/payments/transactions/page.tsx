import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { checkPagePermission } from "@/lib/rbac";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

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
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Eyebrow>Organiser dashboard</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Transactions</h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-charcoal/8">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Commission</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-charcoal">{order.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4 text-inkSoft">{order.user.name}</td>
                    <td className="py-3 pr-4 text-inkSoft">{order.orderType}</td>
                    <td className="py-3 pr-4 text-inkSoft">₹{(order.amount / 100).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-orangeSoft text-orangeDeep"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-inkSoft">
                      {order.commission
                        ? `₹${(order.commission.platformAmount / 100).toFixed(2)} / ₹${(
                            order.commission.expertAmount / 100
                          ).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="py-3">
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
          </div>
        </div>
      </Container>
    </section>
  );
}
