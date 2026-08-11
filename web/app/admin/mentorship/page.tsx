import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import BookingActions from "./_components/BookingActions";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-orangeSoft text-orangeDeep",
    confirmed: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-600",
    completed: "bg-navySoft text-navy",
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

export default async function AdminMentorshipPage() {
  await checkPagePermission("mentorship.view");

  const bookings = await prisma.bookingRequest.findMany({
    include: { user: { select: { email: true, name: true } }, mentor: true },
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
            <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Mentorship bookings</h1>
            <p className="text-inkSoft">Manage one-on-one mentorship requests and payments.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-inkSoft">No bookings yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-charcoal">User</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Mentor</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Topic</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Amount</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Status</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Date</th>
                      <th className="px-6 py-4 font-semibold text-charcoal">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/8">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-charcoal">{booking.user.name}</div>
                          <div className="text-xs text-inkSoft">{booking.user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/mentor/${booking.mentor.slug}`}
                            className="font-semibold text-charcoal hover:text-orangeDeep transition"
                          >
                            {booking.mentor.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={booking.topic}>
                          {booking.topic}
                        </td>
                        <td className="px-6 py-4">
                          {booking.amount ? `₹${booking.amount.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-6 py-4">{statusBadge(booking.status)}</td>
                        <td className="px-6 py-4 text-inkSoft">
                          {booking.createdAt.toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <BookingActions id={booking.id} status={booking.status} note={booking.note} />
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
