import { checkPagePermission } from "@/lib/rbac";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { AdminSection } from "@/components/admin/AdminSection";
import DashboardCharts from "./_components/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await checkPagePermission("dashboard.view");

  const data = await getAdminDashboardData();

  return (
    <>
      <AdminHeader
        eyebrow="Analytics"
        title="Dashboard"
        description="Key metrics and trends across users, registrations, orders and bookings."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users" value={data.metrics.totalUsers.toLocaleString("en-IN")} />
        <StatCard label="Active users" value={data.metrics.activeUsers.toLocaleString("en-IN")} />
        <StatCard label="Student profiles" value={data.metrics.studentProfiles.toLocaleString("en-IN")} />
        <StatCard label="Verified experts" value={data.metrics.verifiedExperts.toLocaleString("en-IN")} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active hackathons" value={data.metrics.activeHackathons.toLocaleString("en-IN")} />
        <StatCard label="Registrations" value={data.metrics.totalRegistrations.toLocaleString("en-IN")} />
        <StatCard label="Submissions" value={data.metrics.totalSubmissions.toLocaleString("en-IN")} />
        <StatCard label="Certificates issued" value={data.metrics.totalCertificates.toLocaleString("en-IN")} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total orders" value={data.metrics.totalOrders.toLocaleString("en-IN")} />
        <StatCard label="Paid orders" value={data.metrics.paidOrders.toLocaleString("en-IN")} />
        <StatCard label="Gross revenue" value={`₹${(data.metrics.grossRevenue / 100).toLocaleString("en-IN")}`} />
        <StatCard label="Platform revenue" value={`₹${(data.metrics.platformRevenue / 100).toLocaleString("en-IN")}`} />
      </div>

      <AdminSection title="Trends" description="User sign-ups, revenue and hackathon registrations over the last 30 days.">
        <DashboardCharts data={data} />
      </AdminSection>
    </>
  );
}
