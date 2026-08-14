import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import SetupChecklist from "./_components/SetupChecklist";
import StatRow from "./_components/StatRow";

export const metadata = {
  title: "Expert Dashboard — Embark India",
};

const SAMPLE_EXPERTS = [
  { name: "Priya Sharma", role: "Senior Product Manager, Zepto", sessions: 84, rating: 4.9 },
  { name: "Rahul Mehta", role: "Strategy Consultant, McKinsey", sessions: 121, rating: 5.0 },
  { name: "Ananya Bose", role: "Marketing Lead, Mamaearth", sessions: 56, rating: 4.8 },
];

export default async function ExpertDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: { where: { isActive: true }, select: { id: true, name: true, type: true } },
      availabilities: { select: { id: true }, take: 1 },
    },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  const [upcomingBookings, pendingDms] = await Promise.all([
    prisma.booking.findMany({
      where: {
        expertId: session.user.id,
        status: { in: ["CONFIRMED", "RESCHEDULED", "PENDING_PAYMENT"] },
        scheduledAt: { gte: new Date() },
      },
      include: {
        service: { select: { name: true } },
        client: { select: { name: true, image: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.priorityDM.findMany({
      where: {
        expertId: session.user.id,
        status: { in: ["PAID", "ASSIGNED", "IN_PROGRESS"] },
      },
      include: { student: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Derive checklist completion
  const completedIds: string[] = [];
  if (expertProfile.availabilities.length > 0) completedIds.push("availability");
  if (expertProfile.services.length > 0) completedIds.push("services");
  if (expertProfile.image && expertProfile.headline) completedIds.push("page");
  if (expertProfile.whatsappNumber) completedIds.push("whatsapp");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">
          Hi, {firstName} 👋
        </h1>
        <p className="text-inkSoft text-sm mt-1">Here&apos;s what&apos;s happening with your expert profile.</p>
      </div>

      {/* Setup checklist */}
      <SetupChecklist completedIds={completedIds} />

      {/* Stats */}
      <StatRow
        stats={[
          {
            label: "Sessions",
            value: expertProfile.sessionsCompleted,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
          {
            label: "Students helped",
            value: expertProfile.studentsHelped,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            ),
          },
          {
            label: "Rating",
            value: expertProfile.rating > 0 ? expertProfile.rating.toFixed(1) : "—",
            sub: expertProfile.reviewCount > 0 ? `${expertProfile.reviewCount} reviews` : "No reviews yet",
            icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ),
          },
          {
            label: "Active services",
            value: expertProfile.services.length,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
          },
        ]}
      />

      {/* Two-column cards */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upcoming bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-charcoal">Upcoming bookings</h2>
            <Link href="/expert/bookings" className="text-xs font-semibold text-orangeDeep hover:underline">
              View all →
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-inkSoft">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-sm text-inkSoft">No upcoming bookings</p>
              <p className="text-xs text-inkSoft/60 mt-1">Students will appear here once they book.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex items-center gap-4 rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-orangeDeep/10 flex items-center justify-center shrink-0 text-orangeDeep font-bold text-sm">
                    {booking.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal text-sm truncate">{booking.service.name}</p>
                    <p className="text-xs text-inkSoft truncate">{booking.client.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-charcoal">
                      {new Date(booking.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-inkSoft">
                      {new Date(booking.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Priority DMs + Get inspired */}
        <div className="space-y-5">
          {/* Pending DMs */}
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base text-charcoal">Priority DMs</h2>
              {pendingDms.length > 0 && (
                <span className="text-xs font-bold bg-orangeDeep text-white rounded-full px-2.5 py-0.5">
                  {pendingDms.length}
                </span>
              )}
            </div>

            {pendingDms.length === 0 ? (
              <p className="text-sm text-inkSoft">No pending DMs right now.</p>
            ) : (
              <div className="space-y-2.5">
                {pendingDms.map((dm) => (
                  <Link
                    key={dm.id}
                    href={`/priority-dms/${dm.id}`}
                    className="block rounded-xl bg-cream p-3 hover:bg-orange/5 transition"
                  >
                    <p className="font-semibold text-sm text-charcoal truncate">{dm.title}</p>
                    <p className="text-xs text-inkSoft mt-0.5">{dm.student.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Get inspired */}
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <h2 className="font-display font-bold text-base text-charcoal mb-4">Get inspired</h2>
            <div className="space-y-4">
              {SAMPLE_EXPERTS.map((expert) => (
                <div key={expert.name} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orangeDeep/15 flex items-center justify-center text-orangeDeep font-bold text-sm shrink-0">
                    {expert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal leading-snug">{expert.name}</p>
                    <p className="text-xs text-inkSoft leading-snug truncate">{expert.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-inkSoft">{expert.sessions} sessions</span>
                      <span className="text-[10px] text-orange font-semibold">★ {expert.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
