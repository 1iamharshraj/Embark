import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import RoleForm from "../../_components/RoleForm";

export default async function EditRolePage({ params }: { params: { id: string } }) {
  await checkPagePermission("role.update");

  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id: params.id },
      include: {
        permissions: { include: { permission: true } },
      },
    }),
    prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    }),
  ]);

  if (!role || !permissions.length) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <AdminHeader
        eyebrow="Edit role"
        title={role.name}
        backHref="/admin/roles"
        backLabel="Back to roles"
      />
      <RoleForm
        mode="edit"
        submitUrl={`/api/admin/roles/${role.id}`}
        initial={{
          name: role.name,
          description: role.description || "",
          permissionIds: role.permissions.map((rp) => rp.permission.id),
        }}
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
