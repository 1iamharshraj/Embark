import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-orangeSoft text-orangeDeep",
    confirmed: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-600",
    completed: "bg-navySoft text-navy",
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    shortlisted: "bg-blue-100 text-blue-700",
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

export default async function AccountRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [bookings, speakerApplications, lectureRequests] = await Promise.all([
    prisma.bookingRequest.findMany({
      where: { userId: session.user.id },
      include: { mentor: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.speakerApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lectureRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Eyebrow>Your account</Eyebrow>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">My requests</h1>
              <p className="text-inkSoft">Mentorship bookings, speaker applications, and lecture requests.</p>
            </div>
            <Button href="/account" variant="ghost" size="sm">
              ← Back to account
            </Button>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/8 bg-cream">
                <h2 className="font-display font-bold text-xl text-charcoal">Mentorship bookings</h2>
              </div>
              {bookings.length === 0 ? (
                <div className="p-6 text-center text-inkSoft">No mentorship bookings yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream/50">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-charcoal">Mentor</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Topic</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Status</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Amount</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/8">
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td className="px-6 py-4">
                            <Link href={`/mentor/${b.mentor.slug}`} className="font-semibold hover:text-orangeDeep transition">
                              {b.mentor.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate" title={b.topic}>{b.topic}</td>
                          <td className="px-6 py-4">{statusBadge(b.status)}</td>
                          <td className="px-6 py-4">{b.amount ? `₹${b.amount.toLocaleString("en-IN")}` : "—"}</td>
                          <td className="px-6 py-4 text-inkSoft">{b.createdAt.toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/8 bg-cream">
                <h2 className="font-display font-bold text-xl text-charcoal">Speaker applications</h2>
              </div>
              {speakerApplications.length === 0 ? (
                <div className="p-6 text-center text-inkSoft">No speaker applications yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream/50">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-charcoal">Name</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Vertical</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Format</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Status</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/8">
                      {speakerApplications.map((s) => (
                        <tr key={s.id}>
                          <td className="px-6 py-4 font-semibold">{s.name}</td>
                          <td className="px-6 py-4">{s.vertical}</td>
                          <td className="px-6 py-4">{s.format}</td>
                          <td className="px-6 py-4">{statusBadge(s.status)}</td>
                          <td className="px-6 py-4 text-inkSoft">{s.createdAt.toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/8 bg-cream">
                <h2 className="font-display font-bold text-xl text-charcoal">Lecture requests</h2>
              </div>
              {lectureRequests.length === 0 ? (
                <div className="p-6 text-center text-inkSoft">No lecture requests yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream/50">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-charcoal">Institute</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Vertical</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Engagement</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Status</th>
                        <th className="px-6 py-3 font-semibold text-charcoal">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/8">
                      {lectureRequests.map((r) => (
                        <tr key={r.id}>
                          <td className="px-6 py-4 font-semibold">{r.institute}</td>
                          <td className="px-6 py-4">{r.vertical}</td>
                          <td className="px-6 py-4">{r.engagement}</td>
                          <td className="px-6 py-4">{statusBadge(r.status)}</td>
                          <td className="px-6 py-4 text-inkSoft">{r.createdAt.toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
