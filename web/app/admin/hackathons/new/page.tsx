import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import HackathonForm from "../_components/HackathonForm";

export default async function NewHackathonPage() {
  await checkPagePermission("hackathon.create");

  return (
    <>
      <AdminHeader
        eyebrow="New hackathon"
        title="Create hackathon"
        backHref="/admin/hackathons"
        backLabel="Back to hackathons"
      />
      <HackathonForm mode="create" submitUrl="/api/v1/admin/hackathons" />
    </>
  );
}
