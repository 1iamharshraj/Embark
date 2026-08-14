import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import ClientDate from "@/components/ClientDate";

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      playbook: { select: { name: true, slug: true } },
      bookingRequest: { include: { mentor: { select: { name: true, slug: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <Eyebrow>Your account</Eyebrow>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2">My orders</h1>
        <p className="text-inkSoft mt-2">
          Playbooks and mentorship sessions you have bought or started checking out.
        </p>
      </div>

      <AdminCard className="overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-inkSoft mb-6">You don&apos;t have any orders yet.</p>
            <Button href="/playbooks" size="sm">
              Browse playbooks
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Type</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Item</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Payment ID</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/8">
                {orders.map((order) => {
                  const item =
                    order.type === "mentorship" && order.bookingRequest
                      ? {
                          label: `Mentorship — ${order.bookingRequest.mentor.name}`,
                          href: `/mentor/${order.bookingRequest.mentor.slug}`,
                        }
                      : order.playbook
                      ? {
                          label: order.playbook.name,
                          href: `/playbook/${order.playbook.slug}`,
                        }
                      : { label: "—", href: "" };

                  return (
                    <tr key={order.id} className="hover:bg-cream/60 transition">
                      <td className="px-6 py-4 capitalize text-charcoal">{order.type}</td>
                      <td className="px-6 py-4">
                        {item.href ? (
                          <Link href={item.href} className="font-semibold text-charcoal hover:text-orangeDeep transition">
                            {item.label}
                          </Link>
                        ) : (
                          <span className="text-inkSoft">{item.label}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-charcoal">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 font-mono text-inkSoft">{order.paymentId || "—"}</td>
                      <td className="px-6 py-4 text-inkSoft whitespace-nowrap">
                        <ClientDate date={order.createdAt} />
                      </td>
                      <td className="px-6 py-4">
                        {order.status === "paid" && item.href ? (
                          <Link href={item.href} className="text-orangeDeep font-semibold hover:underline">
                            {order.type === "mentorship" ? "View mentor" : "Read"}
                          </Link>
                        ) : (
                          <span className="text-inkSoft">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
