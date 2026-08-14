import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";

export default async function AdminSpeakersPage() {
  await checkPagePermission("speaker.view");

  return (
    <>
      <AdminHeader
        eyebrow="Admin"
        title="Speaker applications"
        description="Speaker application review tools coming in the next phase."
        backHref="/admin"
        backLabel="Back to admin"
      />
      <AdminCard>
        <div className="p-8 text-center text-inkSoft">
          Speaker application review tools coming in the next phase.
        </div>
      </AdminCard>
    </>
  );
}
