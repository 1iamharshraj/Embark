import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ClientDate from "@/components/ClientDate";
import Button from "@/components/Button";

export default async function PackagePurchaseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const purchase = await prisma.packagePurchase.findUnique({
    where: { id: params.id, studentId: session.user.id },
    include: {
      package: {
        include: {
          expertProfile: {
            select: { userId: true, slug: true, user: { select: { name: true } } },
          },
          items: {
            include: { service: { select: { id: true, name: true, type: true, durationMinutes: true } } },
          },
        },
      },
      usages: true,
    },
  });

  if (!purchase) notFound();

  const now = new Date();
  const expired = purchase.validUntil <= now;

  const usageByService = purchase.usages.reduce<Record<string, number>>((acc, u) => {
    const item = purchase.package.items.find((i) => i.service.type === u.serviceType);
    const key = item?.serviceId || u.serviceType;
    acc[key] = (acc[key] || 0) + u.quantityUsed;
    return acc;
  }, {});

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <Eyebrow>Package</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
              {purchase.package.name}
            </h1>
            <p className="text-inkSoft">
              by{" "}
              <Link
                href={`/expert/${purchase.package.expertProfile.slug}`}
                className="text-orangeDeep hover:underline"
              >
                {purchase.package.expertProfile.user.name}
              </Link>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                  expired || purchase.status === "EXPIRED"
                    ? "bg-gray-100 text-gray-600"
                    : purchase.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : purchase.status === "PARTIALLY_USED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {expired && purchase.status !== "EXPIRED" ? "Expired" : purchase.status}
              </span>
              <span className="text-sm text-inkSoft">
                Valid until{" "}
                <ClientDate date={purchase.validUntil} options={{ dateStyle: "medium" }} />
              </span>
            </div>

            <p className="text-charcoal leading-relaxed">
              {purchase.package.description || "No description provided."}
            </p>

            <div className="rounded-xl bg-cream p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">
                Paid
              </div>
              <div className="text-charcoal font-semibold">
                ₹{(purchase.amount / 100).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <h2 className="font-display font-bold text-xl text-charcoal mb-5">What&apos;s included</h2>
            {purchase.package.items.length === 0 ? (
              <p className="text-inkSoft">No services in this package.</p>
            ) : (
              <div className="space-y-3">
                {purchase.package.items.map((item) => {
                  const used = usageByService[item.serviceId] || 0;
                  const remaining = Math.max(0, item.quantity - used);
                  const isDm = item.service.type === "PRIORITY_DM";
                  const actionHref = isDm
                    ? `/priority-dm/${purchase.package.expertProfile.userId}`
                    : `/booking/${item.service.id}`;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-cream"
                    >
                      <div>
                        <p className="font-semibold text-charcoal">{item.service.name}</p>
                        <p className="text-sm text-inkSoft">
                          {item.service.type.replace("_", " ")}
                          {item.service.durationMinutes ? ` · ${item.service.durationMinutes} min` : ""}
                        </p>
                        <p className="text-sm text-charcoal mt-1">
                          {used} / {item.quantity} used · {remaining} remaining
                        </p>
                      </div>
                      {!expired && purchase.status !== "COMPLETED" && remaining > 0 && (
                        <Button href={actionHref} size="sm" variant="primary">
                          {isDm ? "Ask DM" : "Book"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
