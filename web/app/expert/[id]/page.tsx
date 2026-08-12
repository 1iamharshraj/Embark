import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

export const dynamic = "force-dynamic";

async function getExpert(id: string) {
  const expert = await prisma.expertProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      services: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      packages: {
        where: { isActive: true },
        include: { items: { include: { service: { select: { name: true } } } } },
        orderBy: { price: "asc" },
      },
    },
  });

  if (!expert) return null;
  return expert;
}

export default async function ExpertPublicPage({ params }: { params: { id: string } }) {
  const expert = await getExpert(params.id);
  if (!expert) notFound();

  const dmService = expert.services.find((s) => s.type === "PRIORITY_DM");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Eyebrow>Expert</Eyebrow>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-full bg-cream overflow-hidden flex items-center justify-center border border-charcoal/8 flex-shrink-0">
                {expert.user.image ? (
                  <img src={expert.user.image} alt={expert.user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-inkSoft">{expert.user.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display font-bold text-3xl text-charcoal">{expert.user.name}</h1>
                  {expert.verificationStatus === "VERIFIED" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2.5 py-1">
                      Embark Verified
                    </span>
                  )}
                </div>
                <p className="text-inkSoft text-lg">{expert.headline}</p>
                {expert.location && <p className="text-sm text-inkSoft mt-1">{expert.location}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  {dmService && (
                    <Link
                      href={`/priority-dm/${expert.user.id}`}
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
                    >
                      Priority DM
                    </Link>
                  )}
                  {expert.services.some((s) => s.type === "ONE_ON_ONE") && (
                    <Link
                      href="#services"
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-5 py-2.5 hover:bg-orange/10 transition"
                    >
                      Book a session
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              {expert.bio && (
                <div>
                  <h2 className="font-display font-bold text-lg text-charcoal mb-2">About</h2>
                  <p className="text-inkSoft whitespace-pre-line">{expert.bio}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {expert.bSchool && (
                  <div className="rounded-xl bg-cream p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Education</div>
                    <div className="text-charcoal font-semibold">{expert.bSchool}</div>
                    <div className="text-sm text-inkSoft">
                      {expert.degree} {expert.specialization && `· ${expert.specialization}`}
                    </div>
                    {expert.graduationYear && <div className="text-sm text-inkSoft">Class of {expert.graduationYear}</div>}
                  </div>
                )}
                {expert.currentCompany && (
                  <div className="rounded-xl bg-cream p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Experience</div>
                    <div className="text-charcoal font-semibold">{expert.currentRole}</div>
                    <div className="text-sm text-inkSoft">{expert.currentCompany}</div>
                    {expert.yearsExperience && <div className="text-sm text-inkSoft">{expert.yearsExperience} years</div>}
                  </div>
                )}
              </div>

              {expert.expertise.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-lg text-charcoal mb-2">Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {expert.expertise.map((item) => (
                      <span
                        key={item}
                        className="inline-block text-sm bg-cream text-charcoal rounded-full px-3 py-1 border border-charcoal/8"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-cream p-4">
                  <div className="font-display font-bold text-2xl text-charcoal">{expert.sessionsCompleted}</div>
                  <div className="text-xs text-inkSoft uppercase tracking-wider">Sessions</div>
                </div>
                <div className="rounded-xl bg-cream p-4">
                  <div className="font-display font-bold text-2xl text-charcoal">{expert.studentsHelped}</div>
                  <div className="text-xs text-inkSoft uppercase tracking-wider">Students</div>
                </div>
                <div className="rounded-xl bg-cream p-4">
                  <div className="font-display font-bold text-2xl text-charcoal">{expert.rating.toFixed(1)}</div>
                  <div className="text-xs text-inkSoft uppercase tracking-wider">Rating</div>
                </div>
              </div>

              <div id="services">
                <h2 className="font-display font-bold text-lg text-charcoal mb-4">Services</h2>
                {expert.services.filter((s) => s.type === "ONE_ON_ONE").length === 0 ? (
                  <p className="text-inkSoft text-sm">No 1:1 sessions available right now.</p>
                ) : (
                  <div className="grid gap-4">
                    {expert.services
                      .filter((s) => s.type === "ONE_ON_ONE")
                      .map((service) => (
                        <div
                          key={service.id}
                          className="rounded-xl bg-cream p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div>
                            <h3 className="font-semibold text-charcoal">{service.name}</h3>
                            <p className="text-sm text-inkSoft mt-1">
                              {service.durationMinutes} min · {service.category || "General"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-charcoal">
                              ₹{(service.price / 100).toFixed(2)}
                            </span>
                            <Link
                              href={`/booking/${service.id}`}
                              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
                            >
                              Book
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-display font-bold text-lg text-charcoal mb-4">Packages</h2>
                {expert.packages.length === 0 ? (
                  <p className="text-inkSoft text-sm">No packages available right now.</p>
                ) : (
                  <div className="grid gap-4">
                    {expert.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="rounded-xl bg-cream p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <h3 className="font-semibold text-charcoal">{pkg.name}</h3>
                          <p className="text-sm text-inkSoft mt-1">
                            {pkg.items.map((i) => `${i.quantity}× ${i.service.name}`).join(" · ")} · {pkg.validityDays}{" "}
                            days
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display font-bold text-charcoal">
                            ₹{(pkg.price / 100).toFixed(2)}
                          </span>
                          <Link
                            href={`/package/${pkg.id}`}
                            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-cream p-5">
                <h2 className="font-display font-bold text-lg text-charcoal mb-2">Reviews</h2>
                <p className="text-inkSoft text-sm">Reviews will appear here once the marketplace goes live.</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
