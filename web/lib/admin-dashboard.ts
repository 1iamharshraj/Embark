import { prisma } from "./prisma";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function buildTimeSeries<T extends { createdAt: Date | string }>(items: T[], days: number): { date: string; count: number }[] {
  const map = new Map<string, number>();
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map.set(formatDateKey(d), 0);
  }
  for (const item of items) {
    const key = formatDateKey(new Date(item.createdAt));
    if (map.has(key)) {
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAdminDashboardData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    activeUsers,
    studentProfiles,
    expertProfiles,
    verifiedExperts,
    totalHackathons,
    publishedHackathons,
    activeHackathons,
    totalRegistrations,
    totalSubmissions,
    totalCertificates,
    totalOrders,
    paidOrders,
    grossRevenue,
    platformRevenue,
    pendingPayouts,
    pendingRefunds,
    recentUsers,
    recentPayments,
    recentRegistrations,
    bookingsByStatus,
    topHackathons,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.studentProfile.count(),
    prisma.expertProfile.count(),
    prisma.expertProfile.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.hackathon.count(),
    prisma.hackathon.count({ where: { status: { not: "DRAFT" } } }),
    prisma.hackathon.count({ where: { status: { in: ["PUBLISHED", "REGISTRATION_OPEN", "HACKATHON_ACTIVE", "SUBMISSION_OPEN", "EVALUATION"] } } }),
    prisma.hackathonRegistration.count(),
    prisma.hackathonSubmission.count(),
    prisma.certificate.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "CAPTURED" } }),
    prisma.commission.aggregate({ _sum: { platformAmount: true } }),
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.refund.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.payment.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: "CAPTURED" },
      select: { createdAt: true, amount: true },
    }),
    prisma.hackathonRegistration.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.booking.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.hackathon.findMany({
      where: { status: { not: "DRAFT" } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { registrations: true, submissions: true } } },
    }),
  ]);

  const usersOverTime = buildTimeSeries(recentUsers, 30);
  const revenueOverTime = buildTimeSeries(recentPayments, 30).map((d) => ({
    date: d.date,
    amount: recentPayments
      .filter((p) => formatDateKey(new Date(p.createdAt)) === d.date)
      .reduce((sum, p) => sum + p.amount, 0),
  }));
  const registrationsOverTime = buildTimeSeries(recentRegistrations, 30);

  return {
    metrics: {
      totalUsers,
      activeUsers,
      studentProfiles,
      expertProfiles,
      verifiedExperts,
      totalHackathons,
      publishedHackathons,
      activeHackathons,
      totalRegistrations,
      totalSubmissions,
      totalCertificates,
      totalOrders,
      paidOrders,
      grossRevenue: grossRevenue._sum.amount || 0,
      platformRevenue: platformRevenue._sum.platformAmount || 0,
      pendingPayouts,
      pendingRefunds,
    },
    charts: {
      usersOverTime,
      revenueOverTime,
      registrationsOverTime,
      bookingsByStatus: bookingsByStatus.map((b) => ({ status: b.status, count: b._count.status })),
      topHackathons: topHackathons.map((h) => ({
        title: h.title,
        registrations: h._count.registrations,
        submissions: h._count.submissions,
      })),
    },
  };
}
