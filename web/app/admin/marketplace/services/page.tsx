import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ToggleService from "../_components/ToggleService";

export default async function AdminMarketplaceServicesPage() {
  await checkPagePermission("dashboard.view");

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      expertProfile: { include: { user: { select: { name: true } } } },
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
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Services</h1>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Name</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Expert</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Type</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Price</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4 font-semibold text-charcoal">{service.name}</td>
                    <td className="px-5 py-4 text-inkSoft">{service.expertProfile.user.name}</td>
                    <td className="px-5 py-4 text-inkSoft">{service.type}</td>
                    <td className="px-5 py-4 text-inkSoft">₹{(service.price / 100).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <ToggleService serviceId={service.id} initialIsActive={service.isActive} />
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-inkSoft">
                      No services found.
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
