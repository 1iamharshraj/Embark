import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const user = await requireAuth();
    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!expertProfile) {
      return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
    }

    const expertId = user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      profileViews,
      serviceViews,
      checkoutStarts,
      bookings,
      dms,
      packagePurchases,
      reviews,
      walletAgg,
      expertServices,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { event: "PROFILE_VIEW", expertId },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["serviceId"],
        where: { event: "SERVICE_VIEW", expertId },
        _count: { id: true },
      }),
      prisma.analyticsEvent.count({
        where: { event: "CHECKOUT_START", expertId },
      }),
      prisma.booking.findMany({
        where: { expertId },
        include: {
          service: { select: { id: true, name: true, price: true } },
          review: true,
          order: { select: { id: true, status: true, createdAt: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.priorityDM.findMany({
        where: { expertId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.packagePurchase.findMany({
        where: { package: { expertProfileId: expertProfile.id } },
        include: { package: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.findMany({
        where: { expertId },
        select: { rating: true },
      }),
      prisma.walletTransaction.aggregate({
        where: { userId: expertId, type: "CREDIT" },
        _sum: { amount: true },
      }),
      prisma.service.findMany({
        where: { expertProfileId: expertProfile.id },
        select: { id: true, name: true, type: true },
      }),
    ]);

    const totalServiceViews = serviceViews.reduce((sum, s) => sum + s._count.id, 0);
    const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
    const completedDms = dms.filter((d) => d.status === "COMPLETED" || d.status === "RESPONDED").length;
    const avgRating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Revenue from authoritative financial records
    const bookingRevenue = bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.expertEarnings, 0);
    const dmRevenue = dms
      .filter((d) => d.status === "COMPLETED" || d.status === "RESPONDED")
      .reduce((sum, d) => sum + d.expertEarnings, 0);
    const packageRevenue = packagePurchases.reduce((sum, p) => sum + p.expertEarnings, 0);

    const totalEarnings = walletAgg._sum.amount ?? 0;

    // Revenue by product type
    const revenueByType: Record<string, number> = {
      BOOKING: bookingRevenue,
      PRIORITY_DM: dmRevenue,
      PACKAGE: packageRevenue,
    };

    // Daily revenue last 30 days
    const dailyRevenue: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyRevenue[formatDateKey(d)] = 0;
    }
    for (const booking of bookings) {
      if (booking.status === "COMPLETED" && booking.expertEarnings > 0) {
        const key = formatDateKey(booking.createdAt);
        if (dailyRevenue[key] !== undefined) {
          dailyRevenue[key] += booking.expertEarnings;
        }
      }
    }
    for (const dm of dms) {
      if ((dm.status === "COMPLETED" || dm.status === "RESPONDED") && dm.expertEarnings > 0) {
        const key = formatDateKey(dm.createdAt);
        if (dailyRevenue[key] !== undefined) {
          dailyRevenue[key] += dm.expertEarnings;
        }
      }
    }
    for (const purchase of packagePurchases) {
      if (purchase.expertEarnings > 0) {
        const key = formatDateKey(purchase.createdAt);
        if (dailyRevenue[key] !== undefined) {
          dailyRevenue[key] += purchase.expertEarnings;
        }
      }
    }

    // Service-level analytics
    const serviceMap: Record<
      string,
      {
        id: string;
        name: string;
        views: number;
        bookings: number;
        completedBookings: number;
        revenue: number;
        ratingSum: number;
        ratingCount: number;
      }
    > = {};
    for (const service of expertServices) {
      serviceMap[service.id] = {
        id: service.id,
        name: service.name,
        views: 0,
        bookings: 0,
        completedBookings: 0,
        revenue: 0,
        ratingSum: 0,
        ratingCount: 0,
      };
    }
    for (const booking of bookings) {
      const key = booking.service.id;
      if (!serviceMap[key]) {
        serviceMap[key] = {
          id: key,
          name: booking.service.name,
          views: 0,
          bookings: 0,
          completedBookings: 0,
          revenue: 0,
          ratingSum: 0,
          ratingCount: 0,
        };
      }
      serviceMap[key].bookings += 1;
      if (booking.status === "COMPLETED") {
        serviceMap[key].completedBookings += 1;
        serviceMap[key].revenue += booking.expertEarnings;
      }
      if (booking.review) {
        serviceMap[key].ratingSum += booking.review.rating;
        serviceMap[key].ratingCount += 1;
      }
    }
    for (const sv of serviceViews) {
      if (sv.serviceId && serviceMap[sv.serviceId]) {
        serviceMap[sv.serviceId].views += sv._count.id;
      }
    }

    const serviceAnalytics = Object.values(serviceMap).map((s) => ({
      ...s,
      conversion: s.views === 0 ? 0 : Number(((s.bookings / s.views) * 100).toFixed(1)),
      rating: s.ratingCount === 0 ? 0 : Number((s.ratingSum / s.ratingCount).toFixed(1)),
    }));

    const totalBookings = bookings.length;
    const bookingStarts = totalBookings + dms.length + checkoutStarts;
    const payments = completedBookings + completedDms + packagePurchases.length;
    const conversion = bookingStarts === 0 ? 0 : Number(((payments / bookingStarts) * 100).toFixed(1));

    return NextResponse.json({
      funnel: {
        profileViews,
        serviceViews: totalServiceViews,
        bookingStarts,
        payments,
        conversion,
      },
      summary: {
        totalBookings,
        completedBookings,
        totalDms: dms.length,
        completedDms,
        packagePurchases: packagePurchases.length,
        totalEarnings,
        reviewCount: reviews.length,
        averageRating: Number(avgRating.toFixed(1)),
      },
      revenue: {
        byType: revenueByType,
        daily: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })),
      },
      services: serviceAnalytics,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch analytics" }, { status: 500 });
  }
}
