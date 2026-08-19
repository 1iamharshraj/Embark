import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ClientDate from "@/components/ClientDate";
import CustomerNotesForm from "./_components/CustomerNotesForm";

interface CustomerDetailPageProps {
  params: Promise<{ studentId: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { studentId } = await params;

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
  });
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  const isAdmin = currentUser?.isAdmin === true;

  if (!expertProfile && !isAdmin) redirect("/expert/onboarding");

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: { studentProfile: true },
  });
  if (!student) notFound();

  // Access control: the current expert must have a booking, DM, or package relationship
  // with this student. Admins bypass the check.
  const hasRelationship = isAdmin
    ? true
    : !!(await prisma.booking.findFirst({
        where: { expertId: session.user.id, clientId: studentId },
      })) ||
      !!(await prisma.priorityDM.findFirst({
        where: { expertId: session.user.id, studentId },
      })) ||
      !!(expertProfile &&
        (await prisma.packagePurchase.findFirst({
          where: { studentId, package: { expertProfileId: expertProfile.id } },
        })));

  if (!hasRelationship) {
    redirect("/expert/customers");
  }

  const [bookings, dms, purchases, reviews, orders] = await Promise.all([
    prisma.booking.findMany({
      where: { clientId: studentId, expertId: session.user.id },
      include: { service: { select: { name: true, durationMinutes: true } } },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.priorityDM.findMany({
      where: { studentId, expertId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    expertProfile
      ? prisma.packagePurchase.findMany({
          where: { studentId, package: { expertProfileId: expertProfile.id } },
          include: { package: { select: { name: true, validityDays: true } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.review.findMany({
      where: { studentId, expertId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: studentId, orderType: { in: ["BOOKING", "PRIORITY_DM", "PACKAGE"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPaid = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <Link
              href="/expert/customers"
              className="text-sm font-semibold text-orangeDeep hover:underline"
            >
              ← Back to customers
            </Link>
            <Eyebrow>CRM</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
              {student.name}
            </h1>
            <p className="text-inkSoft mt-1">
              {student.email}
              {student.studentProfile?.college && ` · ${student.studentProfile.college}`}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft/70">Sessions</p>
              <p className="text-2xl font-bold text-charcoal mt-1">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft/70">Priority DMs</p>
              <p className="text-2xl font-bold text-charcoal mt-1">{dms.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft/70">Total paid</p>
              <p className="text-2xl font-bold text-charcoal mt-1">₹{(totalPaid / 100).toFixed(2)}</p>
            </div>
          </div>

          {student.studentProfile?.bio && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
              <h2 className="font-semibold text-charcoal mb-2">Student bio</h2>
              <p className="text-sm text-inkSoft whitespace-pre-line">{student.studentProfile.bio}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <h2 className="font-semibold text-charcoal mb-4">Sessions</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-inkSoft">No sessions yet.</p>
            ) : (
              <div className="divide-y divide-charcoal/8">
                {bookings.map((booking) => (
                  <div key={booking.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-charcoal">{booking.service.name}</p>
                      <p className="text-xs text-inkSoft/70 capitalize">{booking.status.toLowerCase().replace(/_/g, " ")}</p>
                    </div>
                    <p className="text-sm text-inkSoft">
                      <ClientDate date={booking.scheduledAt} options={{ dateStyle: "medium", timeStyle: "short" }} />
                      {" · "}
                      {booking.durationMinutes} min
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <h2 className="font-semibold text-charcoal mb-4">Priority DMs</h2>
            {dms.length === 0 ? (
              <p className="text-sm text-inkSoft">No priority DMs yet.</p>
            ) : (
              <div className="divide-y divide-charcoal/8">
                {dms.map((dm) => (
                  <div key={dm.id} className="py-4">
                    <p className="font-semibold text-charcoal">{dm.title}</p>
                    <p className="text-xs text-inkSoft/70 capitalize mt-0.5">{dm.status.toLowerCase().replace(/_/g, " ")}</p>
                    {dm.response && <p className="text-sm text-inkSoft mt-2">{dm.response}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <h2 className="font-semibold text-charcoal mb-4">Packages purchased</h2>
            {purchases.length === 0 ? (
              <p className="text-sm text-inkSoft">No packages purchased yet.</p>
            ) : (
              <div className="divide-y divide-charcoal/8">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-charcoal">{purchase.package.name}</p>
                      <p className="text-xs text-inkSoft/70 capitalize">{purchase.status.toLowerCase().replace(/_/g, " ")}</p>
                    </div>
                    <p className="text-sm text-inkSoft">
                      Valid until <ClientDate date={purchase.validUntil} options={{ dateStyle: "medium" }} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <h2 className="font-semibold text-charcoal mb-4">Payment history</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-inkSoft">No payments yet.</p>
            ) : (
              <div className="divide-y divide-charcoal/8">
                {orders.map((order) => (
                  <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-charcoal">{order.orderType.replace(/_/g, " ")}</p>
                      <p className="text-xs text-inkSoft/70 capitalize">{order.status}</p>
                    </div>
                    <p className="text-sm text-inkSoft">
                      ₹{(order.amount / 100).toFixed(2)} ·{" "}
                      <ClientDate date={order.createdAt} options={{ dateStyle: "medium" }} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
            <h2 className="font-semibold text-charcoal mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-inkSoft">No reviews yet.</p>
            ) : (
              <div className="divide-y divide-charcoal/8">
                {reviews.map((review) => (
                  <div key={review.id} className="py-4">
                    <div className="flex items-center gap-1 text-orangeDeep">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                    {review.text && <p className="text-sm text-inkSoft mt-2">{review.text}</p>}
                    <p className="text-xs text-inkSoft/60 mt-1 capitalize">{review.status.toLowerCase()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-orange/5 rounded-2xl border border-orange/20 p-6">
            <CustomerNotesForm studentId={studentId} />
          </div>
        </div>
      </Container>
    </section>
  );
}
