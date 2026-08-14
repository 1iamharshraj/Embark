import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { checkPagePermission } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
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
    <>
      <AdminHeader
        eyebrow="Mentorship"
        title="Marketplace"
        description="Overview of services, packages, bookings and priority DMs."
        backHref="/admin"
      />

      <div className="space-y-8">
        <AdminDataTable
          title="Services"
          count={services.length}
          empty={
            services.length === 0 && (
              <div className="p-8 text-center text-inkSoft">No services yet.</div>
            )
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="bg-cream border-b border-charcoal/8">
              <tr>
                <th className="px-5 py-3 font-semibold text-charcoal">Name</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Type</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Price</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-cream/50 transition">
                  <td className="px-5 py-4 font-semibold text-charcoal">{service.name}</td>
                  <td className="px-5 py-4 text-inkSoft">{service.expertProfile.user.name}</td>
                  <td className="px-5 py-4 text-inkSoft">{service.type}</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(service.price / 100).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <ToggleService serviceId={service.id} initialIsActive={service.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>

        <AdminDataTable
          title="Packages"
          count={packages.length}
          empty={
            packages.length === 0 && (
              <div className="p-8 text-center text-inkSoft">No packages yet.</div>
            )
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="bg-cream border-b border-charcoal/8">
              <tr>
                <th className="px-5 py-3 font-semibold text-charcoal">Name</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Price</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Validity</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-cream/50 transition">
                  <td className="px-5 py-4 font-semibold text-charcoal">{pkg.name}</td>
                  <td className="px-5 py-4 text-inkSoft">{pkg.expertProfile.user.name}</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(pkg.price / 100).toFixed(2)}</td>
                  <td className="px-5 py-4 text-inkSoft">{pkg.validityDays} days</td>
                  <td className="px-5 py-4">
                    <TogglePackage packageId={pkg.id} initialIsActive={pkg.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>

        <AdminDataTable
          title="Bookings"
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
                <th className="px-5 py-3 font-semibold text-charcoal">Service</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Student</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Scheduled</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Amount</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-cream/50 transition">
                  <td className="px-5 py-4 font-semibold text-charcoal">
                    <Link href={`/bookings/${booking.id}`} className="hover:text-orangeDeep transition">
                      {booking.service.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-inkSoft">{booking.expert.name}</td>
                  <td className="px-5 py-4 text-inkSoft">{booking.client.name}</td>
                  <td className="px-5 py-4 text-inkSoft">{new Date(booking.scheduledAt).toLocaleString()}</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(booking.amount / 100).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>

        <AdminDataTable
          title="Priority DMs"
          count={dms.length}
          empty={
            dms.length === 0 && (
              <div className="p-8 text-center text-inkSoft">No priority DMs yet.</div>
            )
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="bg-cream border-b border-charcoal/8">
              <tr>
                <th className="px-5 py-3 font-semibold text-charcoal">Title</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Student</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Amount</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {dms.map((dm) => (
                <tr key={dm.id} className="hover:bg-cream/50 transition">
                  <td className="px-5 py-4 font-semibold text-charcoal">
                    <Link href={`/priority-dms/${dm.id}`} className="hover:text-orangeDeep transition">
                      {dm.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-inkSoft">{dm.expert.name}</td>
                  <td className="px-5 py-4 text-inkSoft">{dm.student.name}</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(dm.amount / 100).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={dm.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>
      </div>
    </>
  );
}
