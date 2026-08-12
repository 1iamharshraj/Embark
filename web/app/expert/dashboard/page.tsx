import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

export default async function ExpertDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: { where: { isActive: true }, select: { id: true, name: true, type: true } },
    },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  const [upcomingBookings, pendingDms, packages] = await Promise.all([
    prisma.booking.findMany({
      where: {
        expertId: session.user.id,
        status: { in: ["CONFIRMED", "RESCHEDULED", "PENDING_PAYMENT"] },
        scheduledAt: { gte: new Date() },
      },
      include: { service: { select: { name: true } }, client: { select: { name: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    }),
    prisma.priorityDM.findMany({
      where: {
        expertId: session.user.id,
        status: { in: ["PAID", "ASSIGNED", "IN_PROGRESS"] },
      },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.package.findMany({
      where: { expertProfileId: expertProfile.id },
      select: { id: true, name: true, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <Eyebrow>Expert dashboard</Eyebrow>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
                Welcome, {session.user.name.split(" ")[0]}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/expert/services"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
              >
                Services
              </Link>
              <Link
                href="/expert/availability"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-5 py-2.5 hover:bg-orange/10 transition"
              >
                Availability
              </Link>
              <Link
                href="/expert/packages"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-5 py-2.5 hover:bg-orange/10 transition"
              >
                Packages
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Sessions", value: expertProfile.sessionsCompleted },
              { label: "Students", value: expertProfile.studentsHelped },
              { label: "Rating", value: expertProfile.rating.toFixed(1) },
              { label: "Services", value: expertProfile.services.length },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5 text-center">
                <div className="font-display font-bold text-2xl text-charcoal">{stat.value}</div>
                <div className="text-xs text-inkSoft uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Upcoming bookings</h2>
              {upcomingBookings.length === 0 ? (
                <p className="text-inkSoft text-sm">No upcoming bookings.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/bookings/${booking.id}`}
                      className="block rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
                    >
                      <p className="font-semibold text-charcoal">{booking.service.name}</p>
                      <p className="text-sm text-inkSoft">
                        {new Date(booking.scheduledAt).toLocaleString()} · {booking.client.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Pending priority DMs</h2>
              {pendingDms.length === 0 ? (
                <p className="text-inkSoft text-sm">No pending DMs.</p>
              ) : (
                <div className="space-y-3">
                  {pendingDms.map((dm) => (
                    <Link
                      key={dm.id}
                      href={`/priority-dms/${dm.id}`}
                      className="block rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
                    >
                      <p className="font-semibold text-charcoal">{dm.title}</p>
                      <p className="text-sm text-inkSoft">{dm.student.name}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mt-6">
            <h2 className="font-display font-bold text-xl text-charcoal mb-4">Your packages</h2>
            {packages.length === 0 ? (
              <p className="text-inkSoft text-sm mb-4">No packages yet.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-xl bg-cream p-4 flex items-center justify-between">
                    <span className="font-semibold text-charcoal">{pkg.name}</span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${
                        pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {pkg.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/expert/packages/new"
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
            >
              New package
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
