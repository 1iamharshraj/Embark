import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { checkPagePermission } from "@/lib/rbac";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ToggleService from "./_components/ToggleService";
import TogglePackage from "./_components/TogglePackage";

export default async function AdminMarketplacePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  await checkPagePermission("dashboard.view");

  const [services, packages, bookings, dms] = await Promise.all([
    prisma.service.findMany({
      include: { expertProfile: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.package.findMany({
      include: { expertProfile: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.booking.findMany({
      include: {
        service: { select: { name: true } },
        client: { select: { name: true } },
        expert: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.priorityDM.findMany({
      include: {
        student: { select: { name: true } },
        expert: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Eyebrow>Organiser dashboard</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Marketplace</h1>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Services</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-inkSoft border-b border-charcoal/8">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Expert</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Price</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="border-b border-charcoal/8 last:border-0">
                        <td className="py-3 pr-4 font-semibold text-charcoal">{service.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">{service.expertProfile.user.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">{service.type}</td>
                        <td className="py-3 pr-4 text-inkSoft">₹{(service.price / 100).toFixed(2)}</td>
                        <td className="py-3">
                          <ToggleService serviceId={service.id} initialIsActive={service.isActive} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Packages</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-inkSoft border-b border-charcoal/8">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Expert</th>
                      <th className="py-2 pr-4">Price</th>
                      <th className="py-2 pr-4">Validity</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="border-b border-charcoal/8 last:border-0">
                        <td className="py-3 pr-4 font-semibold text-charcoal">{pkg.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">{pkg.expertProfile.user.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">₹{(pkg.price / 100).toFixed(2)}</td>
                        <td className="py-3 pr-4 text-inkSoft">{pkg.validityDays} days</td>
                        <td className="py-3">
                          <TogglePackage packageId={pkg.id} initialIsActive={pkg.isActive} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-inkSoft border-b border-charcoal/8">
                      <th className="py-2 pr-4">Service</th>
                      <th className="py-2 pr-4">Expert</th>
                      <th className="py-2 pr-4">Student</th>
                      <th className="py-2 pr-4">Scheduled</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-charcoal/8 last:border-0">
                        <td className="py-3 pr-4 font-semibold text-charcoal">
                          <Link href={`/bookings/${booking.id}`} className="hover:text-orangeDeep transition">
                            {booking.service.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-inkSoft">{booking.expert.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">{booking.client.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">{new Date(booking.scheduledAt).toLocaleString()}</td>
                        <td className="py-3 pr-4 text-inkSoft">₹{(booking.amount / 100).toFixed(2)}</td>
                        <td className="py-3 text-inkSoft">{booking.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Priority DMs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-inkSoft border-b border-charcoal/8">
                      <th className="py-2 pr-4">Title</th>
                      <th className="py-2 pr-4">Expert</th>
                      <th className="py-2 pr-4">Student</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dms.map((dm) => (
                      <tr key={dm.id} className="border-b border-charcoal/8 last:border-0">
                        <td className="py-3 pr-4 font-semibold text-charcoal">
                          <Link href={`/priority-dms/${dm.id}`} className="hover:text-orangeDeep transition">
                            {dm.title}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-inkSoft">{dm.expert.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">{dm.student.name}</td>
                        <td className="py-3 pr-4 text-inkSoft">₹{(dm.amount / 100).toFixed(2)}</td>
                        <td className="py-3 text-inkSoft">{dm.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
