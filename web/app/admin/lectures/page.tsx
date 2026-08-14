import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";

export default async function AdminLecturesPage() {
  await checkPagePermission("lecture.view");

  return (
    <>
      <AdminHeader
        eyebrow="Admin"
        title="Lecture requests"
        description="Lecture request review tools coming in the next phase."
        backHref="/admin"
        backLabel="Back to admin"
      />
      <AdminCard>
        <div className="p-8 text-center text-inkSoft">
          Lecture request review tools coming in the next phase.
        </div>
      </AdminCard>
    </>
  );
}
