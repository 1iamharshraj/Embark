import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";

export default async function AdminMentorsPage() {
  await checkPagePermission("expert.view");

  return (
    <>
      <AdminHeader
        eyebrow="Admin"
        title="Manage mentors"
        description="Mentor management tools coming in the next phase."
        backHref="/admin"
        backLabel="Back to admin"
      />
      <AdminCard>
        <div className="p-8 text-center text-inkSoft">
          Mentor management tools coming in the next phase.
        </div>
      </AdminCard>
    </>
  );
}
