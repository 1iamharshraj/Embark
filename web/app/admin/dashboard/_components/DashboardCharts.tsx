"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  type PieLabel,
} from "recharts";

interface DashboardData {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    studentProfiles: number;
    expertProfiles: number;
    verifiedExperts: number;
    totalHackathons: number;
    publishedHackathons: number;
    totalRegistrations: number;
    totalSubmissions: number;
    totalOrders: number;
    paidOrders: number;
    grossRevenue: number;
    platformRevenue: number;
    pendingPayouts: number;
    pendingRefunds: number;
  };
  charts: {
    usersOverTime: { date: string; count: number }[];
    revenueOverTime: { date: string; amount: number }[];
    registrationsOverTime: { date: string; count: number }[];
    bookingsByStatus: { status: string; count: number }[];
    topHackathons: { title: string; registrations: number; submissions: number }[];
  };
}

const formatCurrency = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

const COLORS = ["#2E6BFF", "#F97316", "#22C55E", "#EAB308", "#8B5CF6", "#EC4899"];

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft">{label}</p>
      <p className="text-2xl font-bold text-charcoal mt-1">{value}</p>
      {sub && <p className="text-sm text-inkSoft mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardCharts({ data }: { data: DashboardData }) {
  const { metrics, charts } = data;

  const chartHeight = 280;

  const recentUsers = useMemo(() => charts.usersOverTime, [charts.usersOverTime]);
  const revenue = useMemo(() => charts.revenueOverTime, [charts.revenueOverTime]);
  const registrations = useMemo(() => charts.registrationsOverTime, [charts.registrationsOverTime]);
  const bookings = useMemo(() => charts.bookingsByStatus, [charts.bookingsByStatus]);
  const topHackathons = useMemo(() => charts.topHackathons, [charts.topHackathons]);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card label="Total users" value={metrics.totalUsers.toLocaleString("en-IN")} sub={`${metrics.activeUsers} active`} />
        <Card label="Students" value={metrics.studentProfiles.toLocaleString("en-IN")} />
        <Card label="Experts" value={metrics.expertProfiles.toLocaleString("en-IN")} sub={`${metrics.verifiedExperts} verified`} />
        <Card label="Hackathons" value={metrics.publishedHackathons.toLocaleString("en-IN")} sub={`${metrics.totalHackathons} total`} />
        <Card label="Registrations" value={metrics.totalRegistrations.toLocaleString("en-IN")} />
        <Card label="Submissions" value={metrics.totalSubmissions.toLocaleString("en-IN")} />
        <Card label="Gross revenue" value={formatCurrency(metrics.grossRevenue)} sub={`${metrics.paidOrders} paid orders`} />
        <Card label="Platform revenue" value={formatCurrency(metrics.platformRevenue)} sub={`${metrics.pendingRefunds} pending refunds`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
          <h3 className="font-display font-bold text-lg text-charcoal mb-4">New users (last 30 days)</h3>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(l) => formatDate(l as string)} />
                <Line type="monotone" dataKey="count" stroke="#2E6BFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
          <h3 className="font-display font-bold text-lg text-charcoal mb-4">Revenue (last 30 days)</h3>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 100).toLocaleString("en-IN")}`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v ?? 0))}
                  labelFormatter={(l) => formatDate(String(l))}
                />
                <Bar dataKey="amount" fill="#2E6BFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
          <h3 className="font-display font-bold text-lg text-charcoal mb-4">Hackathon registrations (last 30 days)</h3>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(l) => formatDate(l as string)} />
                <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
          <h3 className="font-display font-bold text-lg text-charcoal mb-4">Bookings by status</h3>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookings}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={((props: { status?: string; count?: number }) =>
                    `${props.status ?? ""}: ${props.count ?? 0}`) as PieLabel}
                >
                  {bookings.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
        <h3 className="font-display font-bold text-lg text-charcoal mb-4">Top hackathons</h3>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topHackathons} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="registrations" fill="#2E6BFF" radius={[0, 4, 4, 0]} name="Registrations" />
              <Bar dataKey="submissions" fill="#F97316" radius={[0, 4, 4, 0]} name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
