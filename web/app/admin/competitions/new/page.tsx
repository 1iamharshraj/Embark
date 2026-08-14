import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import CompetitionForm from "../_components/CompetitionForm";

export default async function NewCompetitionPage() {
  await checkPagePermission("competition.create");

  return (
    <div className="max-w-4xl mx-auto">
      <AdminHeader
        eyebrow="New competition"
        title="Create a competition"
        description="Add a new competition to the platform."
        backHref="/admin/competitions"
      />
      <CompetitionForm mode="create" submitUrl="/api/admin/competitions" />
    </div>
  );
}
