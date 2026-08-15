import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import RazorpayButton from "@/components/RazorpayButton";

interface PackagePageProps {
  params: { id: string };
}

export default async function PackagePage({ params }: PackagePageProps) {
  const session = await getServerSession(authOptions);

  const pkg = await prisma.package.findUnique({
    where: { id: params.id, isActive: true },
    include: {
      expertProfile: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      items: {
        include: { service: { select: { id: true, name: true, durationMinutes: true, type: true } } },
      },
    },
  });

  if (!pkg) {
    return (
      <section className="bg-cream py-16 sm:py-24 min-h-[60vh]">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-bold text-2xl text-charcoal mb-4">
              Package not found
            </h1>
            <p className="text-inkSoft mb-6">
              The package you&apos;re looking for is unavailable or has been removed.
            </p>
            <Link
              href="/experts"
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition"
            >
              Browse experts
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Marketplace</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-6">
            {pkg.name}
          </h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-3xl font-bold text-charcoal">₹{(pkg.price / 100).toFixed(2)}</p>
                <p className="text-sm text-inkSoft mt-1">
                  Valid for {pkg.validityDays} day{pkg.validityDays === 1 ? "" : "s"}
                </p>
              </div>
              {session?.user?.id ? (
                <RazorpayButton
                  order={{
                    orderType: "PACKAGE",
                    relatedId: pkg.id,
                    name: pkg.name,
                    label: `Buy for ₹${(pkg.price / 100).toFixed(2)}`,
                  }}
                />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition"
                >
                  Login to purchase
                </Link>
              )}
            </div>

            {pkg.description && (
              <p className="text-charcoal leading-relaxed mb-6">{pkg.description}</p>
            )}

            <h2 className="font-display font-semibold text-xl text-charcoal mb-4">
              What&apos;s included
            </h2>
            <ul className="space-y-3">
              {pkg.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-cream"
                >
                  <div>
                    <p className="font-semibold text-charcoal">{item.service.name}</p>
                    <p className="text-sm text-inkSoft">
                      {item.service.type.replace("_", " ")}
                      {item.service.durationMinutes ? ` · ${item.service.durationMinutes} min` : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-charcoal whitespace-nowrap">
                    {item.quantity}×
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orangeSoft flex items-center justify-center text-charcoal font-bold text-lg">
                {pkg.expertProfile.user.name?.charAt(0) || "E"}
              </div>
              <div>
                <p className="font-semibold text-charcoal">{pkg.expertProfile.user.name}</p>
                <Link
                  href={`/mentor/${pkg.expertProfile.slug}`}
                  className="text-sm text-orangeDeep hover:text-[#1740A8] transition"
                >
                  View expert profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
