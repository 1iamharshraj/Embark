import Link from "next/link";
import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/Button";
import ExpertSuspendButton from "../_components/ExpertSuspendButton";

const statusClass: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  PENDING_VERIFICATION: "bg-orangeSoft text-orangeDeep",
  REJECTED: "bg-red-100 text-red-700",
  UNVERIFIED: "bg-gray-100 text-gray-600",
};

export default async function AdminExpertDetailPage({ params }: { params: { id: string } }) {
  await checkPagePermission("expert.view");

  const expert = await prisma.expertProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, active: true } },
      verifications: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!expert) notFound();

  const [services, packages, bookings, dms, reviews, walletSum, payouts] = await Promise.all([
    prisma.service.findMany({
      where: { expertProfileId: expert.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.package.findMany({
      where: { expertProfileId: expert.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.booking.findMany({
      where: { expertId: expert.user.id },
      orderBy: { scheduledAt: "desc" },
      include: { service: { select: { name: true } }, client: { select: { name: true } } },
    }),
    prisma.priorityDM.findMany({
      where: { expertId: expert.user.id },
      orderBy: { createdAt: "desc" },
      include: { student: { select: { name: true } } },
    }),
    prisma.review.findMany({
      where: { expertId: expert.user.id },
      orderBy: { createdAt: "desc" },
      include: { student: { select: { name: true } } },
    }),
    prisma.walletTransaction.aggregate({
      where: { userId: expert.user.id },
      _sum: { amount: true },
    }),
    prisma.payout.findMany({
      where: { userId: expert.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <AdminHeader
        eyebrow="Expert review"
        title={expert.user.name}
        description={expert.user.email}
        backHref="/admin/experts"
        backLabel="Back to experts"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              status={expert.verificationStatus.replace(/_/g, " ")}
              className={statusClass[expert.verificationStatus] || statusClass.UNVERIFIED}
            />
            <Button href={`/admin/experts/${expert.id}/verification`} size="sm">
              Review verification
            </Button>
            <ExpertSuspendButton expertId={expert.id} active={expert.user.active} />
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Services" value={services.length} />
        <StatCard label="Bookings" value={bookings.length} />
        <StatCard label="Reviews" value={reviews.length} />
        <StatCard
          label="Wallet balance"
          value={`₹${((walletSum._sum.amount || 0) / 100).toFixed(2)}`}
        />
      </div>

      <div className="space-y-6">
        <AdminCard className="p-6">
          <h2 className="font-display font-bold text-lg text-charcoal mb-4">Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Headline</h3>
              <p className="text-inkSoft">{expert.headline}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Current role</h3>
              <p className="text-inkSoft">
                {expert.currentRole || "—"} {expert.currentCompany ? `at ${expert.currentCompany}` : ""}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Education</h3>
              <p className="text-inkSoft">
                {expert.bSchool || "—"} · {expert.degree || "—"} {expert.specialization ? `· ${expert.specialization}` : ""}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Experience</h3>
              <p className="text-inkSoft">
                {expert.yearsExperience ? `${expert.yearsExperience} years` : "—"}
              </p>
            </div>
          </div>
          {expert.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {expert.expertise.map((item) => (
                <span
                  key={item}
                  className="text-xs bg-cream text-inkSoft rounded-full px-2 py-1 border border-charcoal/8"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminDataTable title="Services & packages" description="Active services and packages offered by this expert.">
          {services.length === 0 && packages.length === 0 ? (
            <div className="p-6 text-inkSoft">No services or packages yet.</div>
          ) : (
            <div className="p-6 space-y-6">
              {services.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-charcoal mb-2">Services</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-charcoal/8">
                        <tr className="text-left text-inkSoft">
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Price</th>
                          <th className="py-2">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((s) => (
                          <tr key={s.id} className="border-b border-charcoal/8 last:border-0">
                            <td className="py-2 pr-4 font-semibold text-charcoal">{s.name}</td>
                            <td className="py-2 pr-4 text-inkSoft">{s.type}</td>
                            <td className="py-2 pr-4 text-inkSoft">₹{(s.price / 100).toFixed(2)}</td>
                            <td className="py-2 text-inkSoft">{s.isActive ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {packages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-charcoal mb-2">Packages</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-charcoal/8">
                        <tr className="text-left text-inkSoft">
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Price</th>
                          <th className="py-2 pr-4">Validity</th>
                          <th className="py-2">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.map((p) => (
                          <tr key={p.id} className="border-b border-charcoal/8 last:border-0">
                            <td className="py-2 pr-4 font-semibold text-charcoal">{p.name}</td>
                            <td className="py-2 pr-4 text-inkSoft">₹{(p.price / 100).toFixed(2)}</td>
                            <td className="py-2 pr-4 text-inkSoft">{p.validityDays} days</td>
                            <td className="py-2 text-inkSoft">{p.isActive ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </AdminDataTable>

        <AdminDataTable title="Bookings & priority DMs">
          {bookings.length === 0 && dms.length === 0 ? (
            <div className="p-6 text-inkSoft">No bookings or DMs yet.</div>
          ) : (
            <div className="p-6 space-y-6">
              {bookings.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-charcoal/8">
                      <tr className="text-left text-inkSoft">
                        <th className="py-2 pr-4">Service</th>
                        <th className="py-2 pr-4">Student</th>
                        <th className="py-2 pr-4">Scheduled</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-charcoal/8 last:border-0">
                          <td className="py-2 pr-4 font-semibold text-charcoal">{b.service.name}</td>
                          <td className="py-2 pr-4 text-inkSoft">{b.client.name}</td>
                          <td className="py-2 pr-4 text-inkSoft">{new Date(b.scheduledAt).toLocaleString()}</td>
                          <td className="py-2 pr-4 text-inkSoft">₹{(b.amount / 100).toFixed(2)}</td>
                          <td className="py-2">
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {dms.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-charcoal/8">
                      <tr className="text-left text-inkSoft">
                        <th className="py-2 pr-4">Title</th>
                        <th className="py-2 pr-4">Student</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dms.map((dm) => (
                        <tr key={dm.id} className="border-b border-charcoal/8 last:border-0">
                          <td className="py-2 pr-4 font-semibold text-charcoal">{dm.title}</td>
                          <td className="py-2 pr-4 text-inkSoft">{dm.student.name}</td>
                          <td className="py-2 pr-4 text-inkSoft">₹{(dm.amount / 100).toFixed(2)}</td>
                          <td className="py-2">
                            <StatusBadge status={dm.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </AdminDataTable>

        <AdminCard className="p-6">
          <h2 className="font-display font-bold text-lg text-charcoal mb-4">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-inkSoft">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl bg-cream p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-charcoal">{r.student.name}</span>
                    <span className="text-xs text-inkSoft">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-inkSoft">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminDataTable
          title="Payouts"
          count={payouts.length}
          empty={payouts.length === 0 && <div className="p-6 text-inkSoft">No payout requests yet.</div>}
        >
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-charcoal/8">
              <tr>
                <th className="text-left font-semibold text-charcoal px-5 py-3">Amount</th>
                <th className="text-left font-semibold text-charcoal px-5 py-3">Method</th>
                <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
                <th className="text-left font-semibold text-charcoal px-5 py-3">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-cream/50 transition">
                  <td className="px-5 py-4 font-semibold text-charcoal">₹{(p.amount / 100).toFixed(2)}</td>
                  <td className="px-5 py-4 text-inkSoft">{p.method || "—"}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-inkSoft">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>

        <AdminCard className="p-6">
          <h2 className="font-display font-bold text-lg text-charcoal mb-4">Verification history</h2>
          {expert.verifications.length === 0 ? (
            <p className="text-inkSoft">No verification requests yet.</p>
          ) : (
            <div className="space-y-3">
              {expert.verifications.map((v) => (
                <div key={v.id} className="rounded-xl bg-cream p-4">
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge
                      status={v.status.replace(/_/g, " ")}
                      className={statusClass[v.status] || statusClass.UNVERIFIED}
                    />
                    <span className="text-xs text-inkSoft">{v.createdAt.toLocaleDateString("en-IN")}</span>
                  </div>
                  {v.adminNote && <p className="text-sm text-inkSoft mt-2">{v.adminNote}</p>}
                  {v.status === "PENDING_VERIFICATION" && (
                    <Link
                      href={`/admin/experts/${expert.id}/verification?verificationId=${v.id}`}
                      className="text-sm font-semibold text-orange hover:underline mt-2 inline-block"
                    >
                      Review
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </>
  );
}
