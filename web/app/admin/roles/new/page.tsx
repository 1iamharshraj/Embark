import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import RoleForm from "../_components/RoleForm";

export default async function NewRolePage() {
  await checkPagePermission("role.create");

  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });

  if (!permissions.length) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <AdminHeader
        eyebrow="New role"
        title="Create a role"
        backHref="/admin/roles"
        backLabel="Back to roles"
      />
      <RoleForm
        mode="create"
        submitUrl="/api/admin/roles"
        permissions={permissions.map((p) => ({
          id: p.id,
          resource: p.resource,
          action: p.action,
          description: p.description,
        }))}
      />
    </div>
  );
}
