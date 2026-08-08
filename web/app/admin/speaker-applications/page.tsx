import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import SpeakerActions from "./_components/SpeakerActions";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-orangeSoft text-orangeDeep",
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
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

export default async function AdminSpeakerApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/account");

  const applications = await prisma.speakerApplication.findMany({
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
            <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Speaker applications</h1>
            <p className="text-inkSoft">Review and approve guest speaker applications.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-inkSoft">No applications yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream">
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
                      <tr key={app.id}>
                        <td className="px-6 py-4 font-semibold">{app.name}</td>
                        <td className="px-6 py-4 text-inkSoft">{app.email}</td>
                        <td className="px-6 py-4">
                          {app.role}, {app.company}
                        </td>
                        <td className="px-6 py-4">{app.vertical}</td>
                        <td className="px-6 py-4">{app.format}</td>
                        <td className="px-6 py-4">{statusBadge(app.status)}</td>
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
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
