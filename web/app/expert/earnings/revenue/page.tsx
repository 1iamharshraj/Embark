import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "Revenue — Expert earnings",
};

export default async function RevenuePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const orders = await prisma.order.findMany({
    where: {
      status: "paid",
      OR: [
        { booking: { expertId: userId } },
        { dm: { expertId: userId } },
        { purchase: { package: { expertProfile: { userId } } } },
      ],
    },
    include: {
      commission: true,
      booking: true,
      dm: true,
      purchase: { include: { package: true } },
    },
  });

  const byType: Record<string, number> = {};
  let total = 0;
  for (const order of orders) {
    const expertAmount = order.commission?.expertAmount ?? order.amount;
    byType[order.orderType] = (byType[order.orderType] || 0) + expertAmount;
    total += expertAmount;
  }

  const rows = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Earnings</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Revenue breakdown</h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Total earnings</div>
            <div className="font-display font-bold text-3xl text-charcoal">₹{(total / 100).toFixed(2)}</div>
          </div>

          {rows.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 text-center">
              <p className="text-inkSoft">No paid orders yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
              <div className="divide-y divide-charcoal/8">
                {rows.map(([type, amount]) => (
                  <div key={type} className="p-5 flex items-center justify-between">
                    <span className="font-semibold text-charcoal">{type.replace("_", " ")}</span>
                    <span className="font-display font-bold text-charcoal">₹{(amount / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
