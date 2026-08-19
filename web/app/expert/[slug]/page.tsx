import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { StarRating } from "@/components/ReviewList";
import ClientDate from "@/components/ClientDate";
import ProfileViewTracker from "./_components/ProfileViewTracker";

export const dynamic = "force-dynamic";

type PageSettings = {
  accentColor?: string;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
};

const DEFAULT_SECTION_ORDER = [
  "cover",
  "profile",
  "about",
  "experience",
  "education",
  "expertise",
  "services",
  "packages",
  "testimonials",
  "availability",
];

function getPageSettings(raw: unknown | null): PageSettings {
  if (!raw || typeof raw !== "object") return {};
  return raw as PageSettings;
}

function isVisible(key: string, settings: PageSettings): boolean {
  if (settings.sectionVisibility && key in settings.sectionVisibility) {
    return settings.sectionVisibility[key] !== false;
  }
  return true;
}

async function getExpert(slug: string) {
  const expert = await prisma.expertProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      educations: { orderBy: { displayOrder: "asc" } },
      experiences: { orderBy: { displayOrder: "asc" } },
      services: {
        where: { status: "PUBLISHED" },
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

  const [reviews, dms] = await Promise.all([
    prisma.review.findMany({
      where: { expertId: expert.userId, status: "PUBLISHED" },
      include: { student: { select: { id: true, name: true, image: true } } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    prisma.priorityDM.findMany({
      where: {
        expertId: expert.userId,
        status: { notIn: ["CANCELLED", "REFUNDED", "EXPIRED"] },
      },
      select: { status: true, createdAt: true, responseAt: true },
    }),
  ]);

  const respondedDms = dms.filter((dm) => dm.status === "RESPONDED" || dm.status === "COMPLETED");
  const responseRate = dms.length === 0 ? null : Math.round((respondedDms.length / dms.length) * 100);
  const avgResponseHours =
    respondedDms.length === 0
      ? null
      : respondedDms.reduce((sum, dm) => {
          if (!dm.responseAt) return sum;
          return sum + (new Date(dm.responseAt).getTime() - new Date(dm.createdAt).getTime()) / 36e5;
        }, 0) / respondedDms.length;

  return { ...expert, reviews, responseRate, avgResponseHours };
}

export default async function ExpertPublicPage({ params }: { params: { slug: string } }) {
  const expert = await getExpert(params.slug);
  if (!expert) notFound();

  const dmService = expert.services.find((s) => s.type === "PRIORITY_DM");
  const settings = getPageSettings(expert.pageSettings);
  const accent = settings.accentColor || "#1D4ED8";
  const sectionOrder = settings.sectionOrder?.length ? settings.sectionOrder : DEFAULT_SECTION_ORDER;

  const hasEducation = expert.educations.length > 0 || expert.bSchool;
  const hasExperience = expert.experiences.length > 0 || expert.currentCompany;
  const hasExpertise = expert.expertise.length > 0;
  const hasServices = expert.services.some((s) => s.type === "ONE_ON_ONE");
  const hasPackages = expert.packages.length > 0;

  const sections: Record<string, React.ReactNode> = {
    cover: isVisible("cover", settings) && expert.coverImage ? (
      <div key="cover" className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-6">
        <Image src={expert.coverImage} alt={`${expert.user.name} cover`} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
      </div>
    ) : null,
    profile: (
      <div key="profile" className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-full bg-cream overflow-hidden flex items-center justify-center border border-charcoal/8 flex-shrink-0">
          {expert.user.image ? (
            <Image src={expert.user.image} alt={expert.user.name} fill className="object-cover" sizes="96px" />
          ) : (
            <span className="text-3xl text-inkSoft">{expert.user.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="font-display font-bold text-3xl text-charcoal">{expert.user.name}</h1>
            {expert.verificationStatus === "VERIFIED" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2.5 py-1">
                Embark Verified
              </span>
            )}
          </div>
          <p className="text-inkSoft text-lg">{expert.headline}</p>
          {expert.location && <p className="text-sm text-inkSoft mt-1">{expert.location}</p>}

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-inkSoft">
            {expert.rating > 0 && expert.reviewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={expert.rating} />
                <span className="font-semibold text-charcoal">{expert.rating.toFixed(1)}</span>
                <span>({expert.reviewCount} review{expert.reviewCount === 1 ? "" : "s"})</span>
              </div>
            )}
            {expert.sessionsCompleted > 0 && (
              <span>{expert.sessionsCompleted} session{expert.sessionsCompleted === 1 ? "" : "s"} completed</span>
            )}
            {expert.studentsHelped > 0 && <span>{expert.studentsHelped} student{expert.studentsHelped === 1 ? "" : "s"} helped</span>}
            {expert.responseRate !== null && (
              <span>{expert.responseRate}% response rate</span>
            )}
            {expert.avgResponseHours !== null && (
              <span>~{Math.round(expert.avgResponseHours)}h response time</span>
            )}
            {expert.bSchool && <span>{expert.bSchool}</span>}
            {expert.currentCompany && <span>{expert.currentCompany}</span>}
            {expert.yearsExperience !== null && <span>{expert.yearsExperience} years experience</span>}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {dmService && (
              <Link
                href={`/priority-dm/${expert.user.id}`}
                className="inline-flex items-center justify-center rounded-full font-semibold text-white px-5 py-2.5 transition"
                style={{ backgroundColor: accent }}
              >
                Priority DM
              </Link>
            )}
            {hasServices && (
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
    ),
    about: isVisible("about", settings) && expert.bio ? (
      <div key="about">
        <h2 className="font-display font-bold text-lg text-charcoal mb-2">About</h2>
        <p className="text-inkSoft whitespace-pre-line">{expert.bio}</p>
      </div>
    ) : null,
    experience: isVisible("experience", settings) && hasExperience ? (
      <div key="experience">
        <h2 className="font-display font-bold text-lg text-charcoal mb-3">Experience</h2>
        <div className="grid gap-3">
          {expert.experiences.length > 0 ? (
            expert.experiences.map((exp) => (
              <div key={exp.id} className="rounded-xl bg-cream p-4">
                <div className="text-charcoal font-semibold">{exp.role}</div>
                <div className="text-sm text-inkSoft">{exp.company}</div>
                {(exp.startYear || exp.endYear || exp.isCurrent) && (
                  <div className="text-xs text-inkSoft mt-1">
                    {exp.startYear || "?"} – {exp.isCurrent ? "Present" : exp.endYear || "?"}
                  </div>
                )}
                {exp.description && <p className="text-sm text-inkSoft mt-2">{exp.description}</p>}
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-cream p-4">
              <div className="text-charcoal font-semibold">{expert.currentRole}</div>
              <div className="text-sm text-inkSoft">{expert.currentCompany}</div>
              {expert.yearsExperience && <div className="text-xs text-inkSoft mt-1">{expert.yearsExperience} years</div>}
            </div>
          )}
        </div>
      </div>
    ) : null,
    education: isVisible("education", settings) && hasEducation ? (
      <div key="education">
        <h2 className="font-display font-bold text-lg text-charcoal mb-3">Education</h2>
        <div className="grid gap-3">
          {expert.educations.length > 0 ? (
            expert.educations.map((edu) => (
              <div key={edu.id} className="rounded-xl bg-cream p-4">
                <div className="text-charcoal font-semibold">{edu.institution}</div>
                <div className="text-sm text-inkSoft">
                  {edu.degree} {edu.specialization && `· ${edu.specialization}`}
                </div>
                {(edu.startYear || edu.endYear || edu.isCurrent) && (
                  <div className="text-xs text-inkSoft mt-1">
                    {edu.startYear || "?"} – {edu.isCurrent ? "Present" : edu.endYear || "?"}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-cream p-4">
              <div className="text-charcoal font-semibold">{expert.bSchool}</div>
              <div className="text-sm text-inkSoft">
                {expert.degree} {expert.specialization && `· ${expert.specialization}`}
              </div>
              {expert.graduationYear && <div className="text-sm text-inkSoft">Class of {expert.graduationYear}</div>}
            </div>
          )}
        </div>
      </div>
    ) : null,
    expertise: isVisible("expertise", settings) && hasExpertise ? (
      <div key="expertise">
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
    ) : null,
    services: isVisible("services", settings) ? (
      <div key="services" id="services">
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Services</h2>
        {!hasServices ? (
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
                    {Array.isArray(service.outcomes) && service.outcomes.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {service.outcomes.map((outcome, i) => (
                          <li key={i} className="text-xs text-inkSoft flex items-start gap-1.5">
                            <span className="text-green-600">✓</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-charcoal">
                      ₹{(service.price / 100).toFixed(2)}
                    </span>
                    <Link
                      href={`/booking/${service.id}`}
                      className="inline-flex items-center justify-center rounded-full font-semibold text-white px-5 py-2.5 transition"
                      style={{ backgroundColor: accent }}
                    >
                      Book
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    ) : null,
    packages: isVisible("packages", settings) ? (
      <div key="packages">
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Packages</h2>
        {!hasPackages ? (
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
                    {pkg.items.map((i) => `${i.quantity}× ${i.service.name}`).join(" · ")} · {pkg.validityDays} days
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-charcoal">
                    ₹{(pkg.price / 100).toFixed(2)}
                  </span>
                  <Link
                    href={`/package/${pkg.id}`}
                    className="inline-flex items-center justify-center rounded-full font-semibold text-white px-5 py-2.5 transition"
                    style={{ backgroundColor: accent }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : null,
    testimonials: isVisible("testimonials", settings) ? (
      <div key="testimonials" className="space-y-5">
        {expert.reviews.some((r) => r.isFeatured) && (
          <div className="rounded-xl bg-orange/5 border border-orange/20 p-5">
            <h2 className="font-display font-bold text-lg text-charcoal mb-4">Featured testimonials</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {expert.reviews
                .filter((r) => r.isFeatured)
                .map((review) => (
                  <div key={review.id} className="rounded-xl bg-white border border-charcoal/8 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-sm font-semibold text-charcoal">
                        {review.student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-charcoal">{review.student.name}</div>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    {review.text && <p className="text-inkSoft text-sm">{review.text}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}
        <div className="rounded-xl bg-cream p-5">
          <h2 className="font-display font-bold text-lg text-charcoal mb-4">Reviews</h2>
          {expert.reviews.length === 0 ? (
            <p className="text-sm text-inkSoft">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {expert.reviews.map((review) => (
                <div key={review.id} className="rounded-xl bg-white border border-charcoal/8 p-4 transition hover:shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-sm font-semibold text-charcoal">
                      {review.student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-charcoal">{review.student.name}</div>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  {review.text && <p className="text-inkSoft text-sm">{review.text}</p>}
                  <p className="text-[10px] text-inkSoft/60 mt-2">
                    <ClientDate date={review.createdAt} />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ) : null,
    availability: isVisible("availability", settings) ? (
      <div key="availability">
        <h2 className="font-display font-bold text-lg text-charcoal mb-2">Availability</h2>
        <p className="text-inkSoft text-sm">Book a session to see the expert&apos;s live calendar and available slots.</p>
      </div>
    ) : null,
  };

  return (
    <section className="bg-cream py-16 sm:py-24">
      <ProfileViewTracker expertId={expert.user.id} />
      <Container>
        <div className="max-w-4xl mx-auto">
          <Eyebrow>Expert</Eyebrow>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <div className="space-y-8">
              {sectionOrder.map((key) => sections[key]).filter(Boolean)}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
