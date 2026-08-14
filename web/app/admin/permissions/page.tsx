import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";

export default async function AdminPermissionsPage() {
  await checkPagePermission("permission.view");

  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
    include: {
      _count: { select: { roles: true } },
    },
  });

  const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
    acc[p.resource] = acc[p.resource] || [];
    acc[p.resource].push(p);
    return acc;
  }, {});

  return (
    <>
      <AdminHeader
        eyebrow="RBAC"
        title="Permissions"
        description="All permissions grouped by resource and the roles that use them."
        backHref="/admin"
        backLabel="Back to admin"
      />

      <div className="space-y-6">
        {Object.entries(grouped).map(([resource, perms]) => (
          <AdminCard key={resource} className="p-6">
            <h2 className="font-display font-bold text-lg text-charcoal capitalize mb-4">{resource}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {perms.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-charcoal/8 p-3 hover:border-charcoal/20 transition"
                >
                  <div className="text-sm font-semibold text-charcoal">
                    {p.action}
                  </div>
                  {p.description && (
                    <div className="text-xs text-inkSoft mt-1">{p.description}</div>
                  )}
                  <div className="text-xs text-orange mt-2">
                    {p._count.roles} role{p._count.roles === 1 ? "" : "s"}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
