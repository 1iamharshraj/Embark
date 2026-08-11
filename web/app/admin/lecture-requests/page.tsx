import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import LectureActions from "./_components/LectureActions";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-orangeSoft text-orangeDeep",
    shortlisted: "bg-blue-100 text-blue-700",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-navySoft text-navy",
    cancelled: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default async function AdminLectureRequestsPage() {
  await checkPagePermission("lecture.view");

  const requests = await prisma.lectureRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <div className="mb-8">
            <Eyebrow>Admin</Eyebrow>
            <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Lecture requests</h1>
            <p className="text-inkSoft">Review guest lecture requests from institutes.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-inkSoft">No requests yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream">
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
                      <tr key={req.id}>
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
                        <td className="px-6 py-4">{statusBadge(req.status)}</td>
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
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
