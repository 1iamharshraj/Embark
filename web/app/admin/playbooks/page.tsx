import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";

export default async function AdminPlaybooksPage() {
  await checkPagePermission("dashboard.view");

  return (
    <>
      <AdminHeader
        eyebrow="Content & events"
        title="Manage playbooks"
        description="Playbook management tools coming in the next phase."
        backHref="/admin"
      />
      <AdminCard className="p-6">
        <p className="text-inkSoft">Playbook management tools coming in the next phase.</p>
      </AdminCard>
    </>
  );
}
