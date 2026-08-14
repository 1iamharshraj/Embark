import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import SettingsForm from "./_components/SettingsForm";

export default async function AdminSettingsPage() {
  await checkPagePermission("settings.view");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto">
      <AdminHeader
        eyebrow="Configuration"
        title="Platform settings"
        description="Update global configuration values used across the platform."
        backHref="/admin"
        backLabel="Back to admin"
      />
      <SettingsForm />
    </div>
  );
}
