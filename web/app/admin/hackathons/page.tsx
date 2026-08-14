import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/Button";
import { hackathonStatus, displayStatus, statusBadgeClass } from "@/lib/hackathon";
import Link from "next/link";

export default async function AdminHackathonsPage() {
  await checkPagePermission("hackathon.view");

  const raw = await prisma.hackathon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      timelines: { orderBy: { startsAt: "asc" } },
      _count: { select: { registrations: true, teams: true, submissions: true } },
    },
  });

  const hackathons = raw.map((h) => ({
    ...h,
    computedStatus: displayStatus(h),
    statusClass: statusBadgeClass(hackathonStatus(h)),
  }));

  return (
    <>
      <AdminHeader
        eyebrow="Hackathons"
        title="Manage hackathons"
        backHref="/admin"
        backLabel="Back to admin"
        actions={<Button href="/admin/hackathons/new">Create hackathon</Button>}
      />

      <AdminDataTable title="All hackathons" count={hackathons.length}>
        <table className="w-full text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Title</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Registrations</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Teams</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Submissions</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hackathons.map((h) => (
              <tr key={h.id} className="border-b border-charcoal/8 last:border-0">
                <td className="px-5 py-4">
                  <div className="font-semibold text-charcoal">{h.title}</div>
                  <div className="text-inkSoft text-xs">{h.slug}</div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={h.computedStatus} className={h.statusClass} />
                </td>
                <td className="px-5 py-4 text-charcoal">{h._count.registrations}</td>
                <td className="px-5 py-4 text-charcoal">{h._count.teams}</td>
                <td className="px-5 py-4 text-charcoal">{h._count.submissions}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/hackathons/${h.id}/edit`} className="text-xs font-semibold text-orange hover:underline">Edit</Link>
                    <Link href={`/admin/hackathons/${h.id}/teams`} className="text-xs font-semibold text-inkSoft hover:underline">Teams</Link>
                    <Link href={`/admin/hackathons/${h.id}/submissions`} className="text-xs font-semibold text-inkSoft hover:underline">Submissions</Link>
                    <Link href={`/admin/hackathons/${h.id}/judges`} className="text-xs font-semibold text-inkSoft hover:underline">Judges</Link>
                    <Link href={`/admin/hackathons/${h.id}/results`} className="text-xs font-semibold text-inkSoft hover:underline">Results</Link>
                  </div>
                </td>
              </tr>
            ))}
            {hackathons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-inkSoft">
                  No hackathons yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
