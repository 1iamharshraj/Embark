import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

export default async function ExpertServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  const services = expertProfile.services;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <Eyebrow>Marketplace</Eyebrow>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
                Your services
              </h1>
            </div>
            <Link
              href="/expert/services/new"
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition"
            >
              + New service
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 text-center">
              <p className="text-inkSoft mb-6">
                You haven&apos;t created any services yet. Create your first service so students can book you.
              </p>
              <Link
                href="/expert/services/new"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition"
              >
                Create a service
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-charcoal uppercase">
                        {service.type.replace("_", " ")}
                      </span>
                      {service.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                          Hidden
                        </span>
                      )}
                    </div>
                    <h2 className="font-display font-semibold text-xl text-charcoal">
                      {service.name}
                    </h2>
                    <p className="text-sm text-inkSoft mt-1">
                      {service.durationMinutes ? `${service.durationMinutes} min` : "DM"} · ₹
                      {(service.price / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/expert/services/${service.id}/edit`}
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-5 py-2.5 hover:bg-orange/10 transition"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
