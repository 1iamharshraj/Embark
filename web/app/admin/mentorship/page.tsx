import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import BookingActions from "./_components/BookingActions";

export default async function AdminMentorshipPage() {
  await checkPagePermission("mentorship.view");

  const bookings = await prisma.bookingRequest.findMany({
    include: { user: { select: { email: true, name: true } }, mentor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        eyebrow="Admin"
        title="Mentorship bookings"
        description="Manage one-on-one mentorship requests and payments."
        backHref="/admin"
        backLabel="Back to admin"
      />

      <AdminDataTable
        title="All bookings"
        description="Showing every mentorship request with status and payment details."
        count={bookings.length}
        empty={
          bookings.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No bookings yet.</div>
          )
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
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
              <tr key={booking.id} className="hover:bg-cream/50 transition">
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
                <td className="px-6 py-4">
                  <StatusBadge status={booking.status} />
                </td>
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
      </AdminDataTable>
    </>
  );
}
