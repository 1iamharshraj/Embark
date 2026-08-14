import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import Button from "@/components/Button";

export default async function AdminRolesPage() {
  await checkPagePermission("role.view");

  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });

  return (
    <>
      <AdminHeader
        eyebrow="RBAC"
        title="Roles"
        description="Manage platform roles and their assigned permissions."
        backHref="/admin"
        backLabel="Back to admin"
        actions={<Button href="/admin/roles/new">Create role</Button>}
      />

      <AdminDataTable
        title="All roles"
        description="Every role with its permission set and user count."
        count={roles.length}
        empty={
          roles.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No roles found.</div>
          )
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Role</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Users</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Permissions</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {roles.map((role) => (
              <tr key={role.id} className="align-top hover:bg-cream/50 transition">
                <td className="px-5 py-4">
                  <div className="font-semibold text-charcoal">{role.name}</div>
                  <div className="text-xs text-inkSoft">{role.description || "—"}</div>
                </td>
                <td className="px-5 py-4 text-charcoal">{role._count.users}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 6).map((p) => (
                      <span
                        key={`${p.permission.resource}.${p.permission.action}`}
                        className="inline-block text-xs bg-cream text-inkSoft rounded-full px-2 py-0.5 border border-charcoal/8"
                      >
                        {p.permission.resource}.{p.permission.action}
                      </span>
                    ))}
                    {role.permissions.length > 6 && (
                      <span className="text-xs text-inkSoft">+{role.permissions.length - 6} more</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/roles/${role.id}/edit`}
                    className="text-xs font-semibold text-orangeDeep hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
