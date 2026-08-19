import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ClientDate from "@/components/ClientDate";

export const metadata: Metadata = {
  title: "Pending earnings — Expert earnings",
};

export default async function PendingEarningsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [confirmedBookings, paidDms, pendingPayouts] = await Promise.all([
    prisma.booking.findMany({
      where: { expertId: userId, status: "CONFIRMED" },
      include: { service: { select: { name: true } }, client: { select: { name: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 50,
    }),
    prisma.priorityDM.findMany({
      where: { expertId: userId, status: { in: ["PAID", "ASSIGNED", "IN_PROGRESS", "RESPONDED"] } },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payout.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingTotal =
    confirmedBookings.reduce((sum, b) => sum + b.expertEarnings, 0) +
    paidDms.reduce((sum, d) => sum + d.expertEarnings, 0);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Earnings</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Pending earnings</h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">
              Estimated pending
            </div>
            <div className="font-display font-bold text-3xl text-charcoal">₹{(pendingTotal / 100).toFixed(2)}</div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Confirmed sessions</h2>
              {confirmedBookings.length === 0 ? (
                <p className="text-inkSoft text-sm">No confirmed sessions awaiting completion.</p>
              ) : (
                <div className="space-y-3">
                  {confirmedBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/bookings/${booking.id}`}
                      className="block rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-charcoal">{booking.service.name}</p>
                          <p className="text-sm text-inkSoft">
                            <ClientDate
                              date={booking.scheduledAt}
                              options={{ dateStyle: "medium", timeStyle: "short" }}
                            />{" "}
                            · {booking.client.name}
                          </p>
                        </div>
                        <span className="font-semibold text-charcoal">
                          ₹{(booking.expertEarnings / 100).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Paid priority DMs</h2>
              {paidDms.length === 0 ? (
                <p className="text-inkSoft text-sm">No paid DMs awaiting completion.</p>
              ) : (
                <div className="space-y-3">
                  {paidDms.map((dm) => (
                    <Link
                      key={dm.id}
                      href={`/priority-dms/${dm.id}`}
                      className="block rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-charcoal">{dm.title}</p>
                          <p className="text-sm text-inkSoft">{dm.student.name}</p>
                        </div>
                        <span className="font-semibold text-charcoal">
                          ₹{(dm.expertEarnings / 100).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Pending payouts</h2>
              {pendingPayouts.length === 0 ? (
                <p className="text-inkSoft text-sm">No pending payout requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingPayouts.map((payout) => (
                    <div key={payout.id} className="rounded-xl bg-cream p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-charcoal">
                          ₹{(payout.amount / 100).toFixed(2)} · {payout.method}
                        </p>
                        <p className="text-xs text-inkSoft">
                          Requested{" "}
                          <ClientDate date={payout.createdAt} options={{ dateStyle: "medium" }} />
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 bg-cream text-charcoal border border-charcoal/12">
                        {payout.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
