import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import PackageForm from "../../_components/PackageForm";

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  const pkg = await prisma.package.findUnique({
    where: { id: params.id, expertProfileId: expertProfile.id },
    include: {
      items: { select: { serviceId: true, quantity: true } },
    },
  });

  if (!pkg) notFound();

  const services = await prisma.service.findMany({
    where: {
      expertProfileId: expertProfile.id,
      status: "PUBLISHED",
      type: { in: ["ONE_ON_ONE", "PRIORITY_DM"] },
    },
    select: { id: true, name: true, type: true, durationMinutes: true, price: true },
    orderBy: { name: "asc" },
  });

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Marketplace</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            Edit package
          </h1>
          <p className="text-inkSoft mb-8">
            Update the bundled services, price, and validity.
          </p>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <PackageForm
              expertProfileId={expertProfile.id}
              services={services}
              initial={{
                id: pkg.id,
                name: pkg.name,
                description: pkg.description,
                price: pkg.price,
                validityDays: pkg.validityDays,
                items: pkg.items,
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
