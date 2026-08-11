import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

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
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <Eyebrow>RBAC</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Permissions</h1>

          <div className="space-y-8">
            {Object.entries(grouped).map(([resource, perms]) => (
              <div key={resource} className="bg-white rounded-2xl border border-charcoal/8 p-6">
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
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
