import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { playbook: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Eyebrow>Your account</Eyebrow>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">My orders</h1>
              <p className="text-inkSoft">Playbooks you have bought or started checking out.</p>
            </div>
            <Button href="/account" variant="ghost" size="sm">
              ← Back to account
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <p className="text-inkSoft mb-6">You don&apos;t have any playbook orders yet.</p>
                <Button href="/playbooks" size="sm">
                  Browse playbooks
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-charcoal">Playbook</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Amount</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Status</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Payment ID</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Date</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/8">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4">
                          <Link
                            href={`/playbook/${order.playbook.slug}`}
                            className="font-semibold text-charcoal hover:text-orangeDeep transition"
                          >
                            {order.playbook.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">₹{order.amount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                              order.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : order.status === "pending"
                                ? "bg-orangeSoft text-orangeDeep"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-inkSoft">
                          {order.paymentId || "—"}
                        </td>
                        <td className="px-6 py-4 text-inkSoft">
                          {order.createdAt.toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          {order.status === "paid" ? (
                            <Link
                              href={`/playbook/${order.playbook.slug}`}
                              className="text-orangeDeep font-semibold hover:underline"
                            >
                              Read
                            </Link>
                          ) : (
                            <span className="text-inkSoft">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
