"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Funnel {
  profileViews: number;
  serviceViews: number;
  bookingStarts: number;
  payments: number;
  conversion: number;
}

interface Summary {
  totalBookings: number;
  completedBookings: number;
  totalDms: number;
  completedDms: number;
  packagePurchases: number;
  totalEarnings: number;
  reviewCount: number;
  averageRating: number;
}

interface RevenueData {
  byType: Record<string, number>;
  daily: { date: string; amount: number }[];
}

interface ServiceAnalytics {
  id: string;
  name: string;
  views: number;
  bookings: number;
  completedBookings: number;
  revenue: number;
  conversion: number;
  rating: number;
}

interface Analytics {
  funnel: Funnel;
  summary: Summary;
  revenue: RevenueData;
  services: ServiceAnalytics[];
}

export default function ExpertAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/analytics");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          toast.error(json.message || "Failed to load analytics");
        }
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.revenue.daily.map((d) => ({
      ...d,
      display: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-inkSoft">Failed to load analytics.</p>
      </div>
    );
  }

  const { funnel, summary, revenue, services } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Analytics</h1>
        <p className="text-inkSoft text-sm mt-1">Understand your page, service and revenue performance.</p>
      </div>

      {/* Funnel */}
      <section>
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Conversion funnel</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Profile views" value={funnel.profileViews} />
          <StatCard label="Service views" value={funnel.serviceViews} />
          <StatCard label="Booking starts" value={funnel.bookingStarts} />
          <StatCard label="Payments" value={funnel.payments} />
          <StatCard label="Conversion" value={`${funnel.conversion}%`} />
        </div>
      </section>

      {/* Summary */}
      <section>
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Summary</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total bookings" value={summary.totalBookings} sub={`${summary.completedBookings} completed`} />
          <StatCard label="Priority DMs" value={summary.totalDms} sub={`${summary.completedDms} answered`} />
          <StatCard label="Package purchases" value={summary.packagePurchases} />
          <StatCard
            label="Total earnings"
            value={`₹${(summary.totalEarnings / 100).toFixed(2)}`}
            sub="Gross revenue"
          />
          <StatCard
            label="Average rating"
            value={summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "—"}
            sub={`${summary.reviewCount} reviews`}
          />
        </div>
      </section>

      {/* Revenue by type */}
      <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Revenue by product type</h2>
        {Object.keys(revenue.byType).length === 0 ? (
          <p className="text-sm text-inkSoft">No revenue yet.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(revenue.byType).map(([type, amount]) => (
              <div key={type} className="rounded-xl bg-cream p-4">
                <p className="text-xs text-inkSoft uppercase tracking-wide font-semibold">{type.replace(/_/g, " ")}</p>
                <p className="font-display font-bold text-xl text-charcoal mt-1">₹{(amount / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daily revenue chart */}
      <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Daily revenue (last 30 days)</h2>
        {chartData.length === 0 || chartData.every((d) => d.amount === 0) ? (
          <p className="text-sm text-inkSoft">No revenue in the last 30 days.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                <XAxis dataKey="display" tick={{ fontSize: 12 }} interval={4} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 100).toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value) => `₹${(Number(value) / 100).toFixed(2)}`}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="amount" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Service analytics */}
      <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 overflow-hidden">
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Service analytics</h2>
        {services.length === 0 ? (
          <p className="text-sm text-inkSoft">No services yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-charcoal/8">
                  <th className="py-3 pr-4 font-semibold">Service</th>
                  <th className="py-3 pr-4 font-semibold">Views</th>
                  <th className="py-3 pr-4 font-semibold">Bookings</th>
                  <th className="py-3 pr-4 font-semibold">Conversion</th>
                  <th className="py-3 pr-4 font-semibold">Revenue</th>
                  <th className="py-3 pr-4 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/8">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="py-3 pr-4 font-medium text-charcoal">{service.name}</td>
                    <td className="py-3 pr-4">{service.views}</td>
                    <td className="py-3 pr-4">{service.bookings}</td>
                    <td className="py-3 pr-4">{service.conversion}%</td>
                    <td className="py-3 pr-4">₹{(service.revenue / 100).toFixed(2)}</td>
                    <td className="py-3 pr-4">{service.rating > 0 ? service.rating.toFixed(1) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
