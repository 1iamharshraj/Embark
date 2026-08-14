import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import SpeakerActions from "./_components/SpeakerActions";

export default async function AdminSpeakerApplicationsPage() {
  await checkPagePermission("speaker.view");

  const applications = await prisma.speakerApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        eyebrow="Admin"
        title="Speaker applications"
        description="Review and approve guest speaker applications."
        backHref="/admin"
        backLabel="Back to admin"
      />

      <AdminDataTable
        title="All applications"
        description="Showing every speaker application with role, company and status."
        count={applications.length}
        empty={
          applications.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No applications yet.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-6 py-4 font-semibold text-charcoal">Name</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Email</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Role & company</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Vertical</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Format</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Status</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Date</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-cream/50 transition">
                <td className="px-6 py-4 font-semibold">{app.name}</td>
                <td className="px-6 py-4 text-inkSoft">{app.email}</td>
                <td className="px-6 py-4">
                  {app.role}, {app.company}
                </td>
                <td className="px-6 py-4">{app.vertical}</td>
                <td className="px-6 py-4">{app.format}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4 text-inkSoft">
                  {app.createdAt.toLocaleDateString("en-IN")}
                </td>
                <td className="px-6 py-4">
                  <SpeakerActions id={app.id} status={app.status} note={app.note} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
