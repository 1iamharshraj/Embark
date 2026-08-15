"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Analytics {
  bookings: number;
  completedBookings: number;
  dms: number;
  completedDms: number;
  totalEarnings: number;
  reviews: number;
  averageRating: number;
}

export default function ExpertAnalyticsPage() {
  const [data, setData] = useState<Analytics>({
    bookings: 0,
    completedBookings: 0,
    dms: 0,
    completedDms: 0,
    totalEarnings: 0,
    reviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bookingsRes, dmsRes, reviewsRes, walletRes] = await Promise.all([
          fetch("/api/v1/bookings"),
          fetch("/api/v1/priority-dms"),
          fetch("/api/v1/reviews?status=PUBLISHED"),
          fetch("/api/v1/wallet"),
        ]);

        const bookings = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };
        const dms = dmsRes.ok ? await dmsRes.json() : { dms: [] };
        const reviews = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] };
        const wallet = walletRes.ok ? await walletRes.json() : { totalCredit: 0 };

        const completedBookings = (bookings.bookings || []).filter(
          (b: { status: string }) => b.status === "COMPLETED"
        ).length;
        const completedDms = (dms.dms || []).filter(
          (d: { status: string }) => d.status === "COMPLETED" || d.status === "RESPONDED"
        ).length;
        const reviewList = reviews.reviews || [];
        const avgRating =
          reviewList.length > 0
            ? reviewList.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewList.length
            : 0;

        setData({
          bookings: (bookings.bookings || []).length,
          completedBookings,
          dms: (dms.dms || []).length,
          completedDms,
          totalEarnings: wallet.totalCredit || 0,
          reviews: reviewList.length,
          averageRating: avgRating,
        });
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Analytics</h1>
        <p className="text-inkSoft text-sm mt-1">A quick snapshot of your activity and earnings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total bookings" value={data.bookings} sub={`${data.completedBookings} completed`} />
        <StatCard label="Priority DMs" value={data.dms} sub={`${data.completedDms} answered`} />
        <StatCard
          label="Total earnings"
          value={`₹${(data.totalEarnings / 100).toFixed(2)}`}
          sub="Gross revenue"
        />
        <StatCard
          label="Average rating"
          value={data.averageRating > 0 ? data.averageRating.toFixed(1) : "—"}
          sub={`${data.reviews} reviews`}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
      <p className="text-xs text-inkSoft uppercase tracking-wide font-semibold">{label}</p>
      <p className="font-display font-bold text-2xl text-charcoal mt-1">{value}</p>
      {sub && <p className="text-xs text-inkSoft/70 mt-0.5">{sub}</p>}
    </div>
  );
}
