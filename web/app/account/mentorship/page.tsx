import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import PayButton from "./_components/PayButton";

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

export default async function AccountMentorshipPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const bookings = await prisma.bookingRequest.findMany({
    where: { userId: session.user.id },
    include: { mentor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Eyebrow>Your account</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2">Mentorship sessions</h1>
          <p className="text-inkSoft mt-2">Track your booking requests and pay for confirmed sessions.</p>
        </div>
        <Button href="/mentorship" variant="primary" size="sm">
          Find a mentor
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-inkSoft mb-6">You haven&apos;t booked any mentorship sessions yet.</p>
            <Button href="/mentorship" size="sm">
              Find a mentor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Mentor</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Topic</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Requested</th>
                  <th className="px-6 py-4 font-semibold text-charcoal whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/8">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-cream/60 transition">
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
                    <td className="px-6 py-4">{statusBadge(booking.status)}</td>
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {booking.amount ? `₹${booking.amount.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-inkSoft whitespace-nowrap">
                      {booking.createdAt.toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === "confirmed" && booking.amount ? (
                        <PayButton
                          bookingId={booking.id}
                          mentorName={booking.mentor.name}
                          mentorSlug={booking.mentor.slug}
                          amount={booking.amount}
                        />
                      ) : booking.status === "paid" ? (
                        <span className="text-green-700 font-semibold text-xs">Paid</span>
                      ) : (
                        <span className="text-inkSoft">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
