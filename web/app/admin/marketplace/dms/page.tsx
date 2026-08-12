import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

export default async function AdminMarketplaceDmsPage() {
  await checkPagePermission("dashboard.view");

  const dms = await prisma.priorityDM.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { name: true, email: true } },
      expert: { select: { name: true, email: true } },
    },
    take: 100,
  });

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/admin/marketplace" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to marketplace
          </Link>
          <Eyebrow>Marketplace</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Priority DMs</h1>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Title</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Expert</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Student</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Amount</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dms.map((dm) => (
                  <tr key={dm.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4 font-semibold text-charcoal">
                      <Link href={`/priority-dms/${dm.id}`} className="hover:text-orangeDeep transition">
                        {dm.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-inkSoft">{dm.expert.name}</td>
                    <td className="px-5 py-4 text-inkSoft">{dm.student.name}</td>
                    <td className="px-5 py-4 text-inkSoft">₹{(dm.amount / 100).toFixed(2)}</td>
                    <td className="px-5 py-4 text-inkSoft">{dm.status}</td>
                  </tr>
                ))}
                {dms.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-inkSoft">
                      No priority DMs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
