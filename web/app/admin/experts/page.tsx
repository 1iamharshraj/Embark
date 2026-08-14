import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

const statusClass: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  PENDING_VERIFICATION: "bg-orangeSoft text-orangeDeep",
  REJECTED: "bg-red-100 text-red-700",
  UNVERIFIED: "bg-gray-100 text-gray-600",
};

export default async function AdminExpertsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  await checkPagePermission("expert.view");

  const status = searchParams?.status;
  const experts = await prisma.expertProfile.findMany({
    where: status ? { verificationStatus: status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      verifications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const filters = ["all", "UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "REJECTED"];

  const filterSlot = (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <Link
          key={f}
          href={f === "all" ? "/admin/experts" : `/admin/experts?status=${f}`}
          className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition ${
            (status || "all") === f
              ? "bg-orangeDeep text-white border-orangeDeep"
              : "bg-white text-charcoal border-charcoal/8 hover:border-orange/40"
          }`}
        >
          {f === "all" ? "All" : f.replace("_", " ")}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <AdminHeader
        eyebrow="Mentorship"
        title="Expert applications"
        description="Review, filter and verify expert applications."
        backHref="/admin"
      />

      <AdminDataTable
        title="All experts"
        description="Applications sorted by most recent submission."
        count={experts.length}
        filterSlot={filterSlot}
        empty={
          experts.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No experts found.</div>
          )
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Expert</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Headline</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Submitted</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/8">
            {experts.map((expert) => (
              <tr key={expert.id} className="align-top hover:bg-cream/50 transition">
                <td className="px-5 py-4">
                  <div className="font-semibold text-charcoal">{expert.user.name}</div>
                  <div className="text-xs text-inkSoft">{expert.user.email}</div>
                </td>
                <td className="px-5 py-4 text-inkSoft">{expert.headline}</td>
                <td className="px-5 py-4">
                  <StatusBadge
                    status={expert.verificationStatus.replace(/_/g, " ")}
                    className={statusClass[expert.verificationStatus] || statusClass.UNVERIFIED}
                  />
                </td>
                <td className="px-5 py-4 text-inkSoft">
                  {expert.verifications[0]?.createdAt.toLocaleDateString("en-IN") || "—"}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/experts/${expert.id}`}
                    className="text-xs font-semibold text-orange hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </>
  );
}
