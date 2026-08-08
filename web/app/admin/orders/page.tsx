import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-orangeSoft text-orangeDeep",
    paid: "bg-green-100 text-green-700",
    refunded: "bg-gray-100 text-gray-600",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/account");

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true, name: true } },
      playbook: { select: { name: true, slug: true } },
      bookingRequest: { include: { mentor: { select: { name: true, slug: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <div className="mb-8">
            <Eyebrow>Admin</Eyebrow>
            <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Orders</h1>
            <p className="text-inkSoft">All playbook and mentorship orders across the platform.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-inkSoft">No orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream">
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
                        <tr key={order.id}>
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
                          <td className="px-6 py-4">{statusBadge(order.status)}</td>
                          <td className="px-6 py-4 font-mono text-inkSoft">{order.paymentId || "—"}</td>
                          <td className="px-6 py-4 text-inkSoft">{order.createdAt.toLocaleDateString("en-IN")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
