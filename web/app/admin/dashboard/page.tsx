import { checkPagePermission } from "@/lib/rbac";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import DashboardCharts from "./_components/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await checkPagePermission("dashboard.view");

  const data = await getAdminDashboardData();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-7xl mx-auto">
          <Eyebrow>Organiser dashboard</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Dashboard</h1>

          <DashboardCharts data={data} />
        </div>
      </Container>
    </section>
  );
}
