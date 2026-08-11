import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
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
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
                ← Back to admin
              </Link>
              <Eyebrow>RBAC</Eyebrow>
              <h1 className="font-display font-bold text-3xl text-charcoal mt-2">Roles</h1>
            </div>
            <Button href="/admin/roles/new">Create role</Button>
          </div>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Role</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Users</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Permissions</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-charcoal/8 last:border-0">
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
                        className="text-xs font-semibold text-orange hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-inkSoft">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
