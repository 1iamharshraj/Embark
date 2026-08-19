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

export default async function ExpertDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: { select: { id: true, name: true, type: true, status: true } },
      availabilities: { select: { id: true }, take: 1 },
      educations: { select: { id: true }, take: 1 },
      experiences: { select: { id: true }, take: 1 },
    },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  const [upcomingBookings, pendingDms, walletStats, payouts] = await Promise.all([
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
    prisma.walletTransaction.groupBy({
      by: ["type"],
      where: { userId: session.user.id },
      _sum: { amount: true },
    }),
    prisma.payout.findMany({
      where: { userId: session.user.id },
      select: { id: true },
      take: 1,
    }),
  ]);

  // Derive checklist completion
  const completedIds: string[] = [];
  if (expertProfile.availabilities.length > 0) completedIds.push("availability");
  if (expertProfile.services.length > 0) completedIds.push("services");
  if (expertProfile.image && expertProfile.headline) completedIds.push("page");
  if (expertProfile.verificationStatus === "VERIFIED") completedIds.push("verification");
  if (payouts.length > 0) completedIds.push("payouts");
  if (expertProfile.whatsappNumber) completedIds.push("whatsapp");

  const publishedServices = expertProfile.services.filter((s) => s.status === "PUBLISHED");

  // Compute richer profile-completion percentage
  let completionScore = 0;
  const hasBasicProfile = Boolean(expertProfile.headline && expertProfile.bio && expertProfile.image);
  const hasCoverImage = Boolean(expertProfile.coverImage);
  const hasProfessionalBackground = Boolean(
    expertProfile.industry && expertProfile.function && (expertProfile.currentRole || expertProfile.currentCompany)
  );
  const hasEducation = Boolean(
    expertProfile.bSchool || expertProfile.degree || expertProfile.educations.length > 0
  );
  const hasExperience = expertProfile.experiences.length > 0;
  const hasExpertise = expertProfile.expertise.length > 0;

  if (hasBasicProfile) completionScore += 25;
  if (hasCoverImage) completionScore += 5;
  if (hasProfessionalBackground) completionScore += 15;
  if (hasEducation) completionScore += 10;
  if (hasExperience) completionScore += 10;
  if (hasExpertise) completionScore += 5;
  if (publishedServices.length > 0) completionScore += 10;
  if (expertProfile.availabilities.length > 0) completionScore += 10;
  if (expertProfile.verificationStatus === "VERIFIED") completionScore += 5;
  if (payouts.length > 0) completionScore += 3;
  if (expertProfile.whatsappNumber) completionScore += 2;

  const totalCredit =
    walletStats.find((s) => s.type === "CREDIT")?._sum.amount || 0;
  const totalDebit =
    walletStats.find((s) => s.type === "DEBIT")?._sum.amount || 0;
  const availableBalance = totalCredit - totalDebit;

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">
          Hi, {firstName} 👋
        </h1>
        <p className="text-inkSoft text-sm mt-1">Here&apos;s what&apos;s happening with your expert profile.</p>
      </div>

      {/* Setup checklist */}
      <SetupChecklist completedIds={completedIds} percent={completionScore} />

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
            value: publishedServices.length,
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

          {/* Earnings snapshot */}
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base text-charcoal">Earnings</h2>
              <Link href="/expert/wallet" className="text-xs font-semibold text-orangeDeep hover:underline">
                Wallet →
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-inkSoft uppercase tracking-wide font-semibold">Available balance</p>
                <p className="font-display font-bold text-2xl text-charcoal">
                  ₹{(availableBalance / 100).toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-cream p-3">
                  <p className="text-[10px] text-inkSoft uppercase tracking-wide font-semibold">Total earned</p>
                  <p className="font-semibold text-sm text-green-700">₹{(totalCredit / 100).toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-cream p-3">
                  <p className="text-[10px] text-inkSoft uppercase tracking-wide font-semibold">Withdrawn</p>
                  <p className="font-semibold text-sm text-inkSoft">₹{(totalDebit / 100).toFixed(2)}</p>
                </div>
              </div>
              <Link
                href="/expert/wallet"
                className="block w-full text-center rounded-full bg-orangeDeep text-white text-sm font-semibold py-2.5 hover:bg-[#1740A8] transition"
              >
                Request payout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
