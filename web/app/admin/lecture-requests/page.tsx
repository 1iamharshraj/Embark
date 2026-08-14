import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import LectureActions from "./_components/LectureActions";

export default async function AdminLectureRequestsPage() {
  await checkPagePermission("lecture.view");

  const requests = await prisma.lectureRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        eyebrow="Admin"
        title="Lecture requests"
        description="Review guest lecture requests from institutes."
        backHref="/admin"
        backLabel="Back to admin"
      />

      <AdminDataTable
        title="All requests"
        description="Showing every lecture request with institute details and status."
        count={requests.length}
        empty={
          requests.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No requests yet.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="px-6 py-4 font-semibold text-charcoal">Institute</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Contact</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Vertical</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Engagement</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Budget</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Status</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Date</th>
              <th className="px-6 py-4 font-semibold text-charcoal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-cream/50 transition">
                <td className="px-6 py-4 font-semibold">{req.institute}</td>
                <td className="px-6 py-4">
                  <div className="text-charcoal">{req.name}</div>
                  <div className="text-xs text-inkSoft">{req.email}</div>
                </td>
                <td className="px-6 py-4">{req.vertical}</td>
                <td className="px-6 py-4">
                  {req.engagement}
                  <div className="text-xs text-inkSoft">{req.format}</div>
                </td>
                <td className="px-6 py-4">{req.budget}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-6 py-4 text-inkSoft">
                  {req.createdAt.toLocaleDateString("en-IN")}
                </td>
                <td className="px-6 py-4">
                  <LectureActions id={req.id} status={req.status} note={req.note} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
