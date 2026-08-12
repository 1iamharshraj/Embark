import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { StaggerContainer, StaggerItem } from "@/components/motion";

const PER_PAGE = 25;

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams?: { actor?: string; action?: string; resource?: string; from?: string; to?: string; page?: string };
}) {
  await checkPagePermission("audit.view");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const actor = searchParams?.actor?.trim() || "";
  const action = searchParams?.action?.trim() || "";
  const resource = searchParams?.resource?.trim() || "";
  const from = searchParams?.from || "";
  const to = searchParams?.to || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));

  const where: {
    action?: { contains: string; mode: "insensitive" };
    resource?: { contains: string; mode: "insensitive" };
    user?: { OR: { email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }[] };
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  if (action) where.action = { contains: action, mode: "insensitive" };
  if (resource) where.resource = { contains: resource, mode: "insensitive" };
  if (actor) {
    where.user = {
      OR: [
        { email: { contains: actor, mode: "insensitive" } },
        { name: { contains: actor, mode: "insensitive" } },
      ],
    };
  }
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  function queryString(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (actor) params.set("actor", actor);
    if (action) params.set("action", action);
    if (resource) params.set("resource", resource);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) params.delete(k);
      else params.set(k, v);
    });
    const s = params.toString();
    return s ? `?${s}` : "";
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-7xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <Eyebrow>Compliance</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Audit logs</h1>

          <form className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <input
              name="actor"
              type="search"
              defaultValue={actor}
              placeholder="Actor name / email"
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
            <input
              name="action"
              type="search"
              defaultValue={action}
              placeholder="Action"
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
            <input
              name="resource"
              type="search"
              defaultValue={resource}
              placeholder="Resource"
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
            <input
              name="from"
              type="date"
              defaultValue={from}
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange"
            />
            <input
              name="to"
              type="date"
              defaultValue={to}
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
              >
                Filter
              </button>
              <Link
                href="/admin/audit-logs"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal border border-charcoal/15 px-5 py-2.5 hover:bg-orange/10 transition"
              >
                Reset
              </Link>
            </div>
          </form>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">When</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Actor</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Action</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Resource</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Details</th>
                </tr>
              </thead>
              <StaggerContainer as="tbody" staggerDelay={0.03}>
                {logs.map((log) => (
                  <StaggerItem key={log.id} as="tr" className="border-b border-charcoal/8 last:border-0 align-top">
                    <td className="px-5 py-4 text-inkSoft whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      {log.user ? (
                        <>
                          <div className="font-semibold text-charcoal">{log.user.name || log.user.email}</div>
                          <div className="text-xs text-inkSoft">{log.user.email}</div>
                        </>
                      ) : (
                        <span className="text-inkSoft">System / unknown</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block text-xs font-semibold bg-orange/10 text-orangeDeep rounded-full px-2.5 py-1">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-charcoal">
                      {log.resource}
                      {log.resourceId && (
                        <div className="text-xs text-inkSoft truncate max-w-[160px]">{log.resourceId}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-inkSoft max-w-md">
                      <details className="text-xs">
                        <summary className="cursor-pointer select-none text-orangeDeep hover:underline">View diff</summary>
                        <pre className="mt-2 p-3 bg-cream rounded-lg overflow-auto text-charcoal">
                          {JSON.stringify({ old: log.oldValue, new: log.newValue }, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </StaggerItem>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-inkSoft">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </StaggerContainer>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Link
                href={`/admin/audit-logs${queryString({ page: page > 1 ? String(page - 1) : undefined })}`}
                className={`px-4 py-2 rounded-full border font-semibold ${
                  page <= 1
                    ? "border-charcoal/10 text-inkSoft pointer-events-none"
                    : "border-charcoal/15 text-charcoal hover:bg-orange/10"
                }`}
              >
                Prev
              </Link>
              <span className="text-sm text-inkSoft">
                Page {page} of {totalPages}
              </span>
              <Link
                href={`/admin/audit-logs${queryString({ page: page < totalPages ? String(page + 1) : undefined })}`}
                className={`px-4 py-2 rounded-full border font-semibold ${
                  page >= totalPages
                    ? "border-charcoal/10 text-inkSoft pointer-events-none"
                    : "border-charcoal/15 text-charcoal hover:bg-orange/10"
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
