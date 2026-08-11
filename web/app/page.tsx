import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Button from "@/components/Button";
import HeroCarousel from "@/components/HeroCarousel";
import PosterMarquee from "@/components/PosterMarquee";
import LiveCompetitions from "@/components/LiveCompetitions";
import PartnersMarquee from "@/components/PartnersMarquee";
import CollegesMarquee from "@/components/CollegesMarquee";
import ServiceStrip from "@/components/ServiceStrip";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const competitions = await prisma.competition.findMany({
    where: { draft: false },
    orderBy: { regClose: "asc" },
    take: 12,
    select: {
      id: true,
      title: true,
      category: true,
      banner: true,
      fee: true,
      regClose: true,
      startAt: true,
      endAt: true,
      banners: true,
    },
  });

  return (
    <>
      <HeroCarousel />
      <PosterMarquee />
      <LiveCompetitions competitions={competitions} />
      <PartnersMarquee />

      <section className="bg-white py-16 sm:py-20 lg:py-24" aria-label="The MBA reality">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-charcoal/14 rounded-3xl overflow-hidden border border-charcoal/14">
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal">2.95L+</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">CAT 2025 registrations</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal">1.42L+</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">XAT registrations</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal">1.57L+</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">MAH MBA CET 2025 registrations</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal mb-2">Multiple exams</span>
              <div className="flex flex-wrap gap-1">
                {["CAT", "XAT", "SNAP", "NMAT", "CMAT", "MAT", "CET"].map((t) => (
                  <span
                    key={t}
                    className="text-[0.64rem] font-semibold bg-white border border-charcoal/18 rounded-full px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition col-span-2 md:col-span-1">
              <span className="font-display font-bold text-lg text-charcoal">Crowded funnel</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Lakhs compete for limited quality outcomes.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Admission is step one</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">The real MBA race begins after joining.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Brand gap is real</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">College reputation still impacts opportunities.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Preparation compounds</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Resume, competitions, internships and interviews matter.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Build proof</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Case competitions, projects and credentials improve visibility.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Get guided</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Mentorship helps students avoid random preparation.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Prepare early</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Summers, PPOs and placements need a plan from year one.</span>
            </div>
            <div className="bg-cream p-6 md:col-span-2 md:row-span-2 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy border-[1.5px] border-navy/40 rounded-full px-4 py-1.5 mb-4">
                The reality
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight text-charcoal mb-3">
                Lakhs enter the MBA race. <span className="text-orange">Very few get a clear roadmap.</span>
              </h2>
              <p className="text-sm text-inkSoft">Embark India exists to close that gap.</p>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Placements are uneven</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Outcomes vary sharply across college tiers.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Even branded colleges face pressure</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">The IIM tag alone is not a full plan.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Preparation compounds</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Resume, competitions, internships and interviews matter.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Build proof</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Case competitions, projects and credentials improve visibility.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Get guided</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Mentorship helps students avoid random preparation.</span>
            </div>
            <div className="bg-[#EEF3FA] p-6 min-h-[132px] flex flex-col justify-center hover:bg-[#FBFCFE] transition">
              <span className="font-display font-bold text-lg text-charcoal">Prepare early</span>
              <span className="text-xs sm:text-sm text-inkSoft mt-2">Summers, PPOs and placements need a plan from year one.</span>
            </div>
            <Link
              href="/mentorship"
              className="bg-navy text-cream p-6 min-h-[132px] flex flex-col justify-center hover:bg-navyDeep transition"
            >
              <span className="font-display font-extrabold text-2xl text-white">
                e<span className="text-orange">MBA</span>rk
              </span>
              <span className="text-xs sm:text-sm text-cream/70 mt-2">Built for tier-2 students who want to compete better.</span>
              <span className="text-sm font-semibold text-orange mt-3 inline-flex items-center gap-1">
                See how <span>→</span>
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <CollegesMarquee />

      <section className="bg-navy py-16 sm:py-20 lg:py-24 relative overflow-hidden text-cream">
        <Container>
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center mb-16">
            <div>
              <p className="text-[0.92rem] font-semibold text-white mb-3">Embark impact</p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-4xl tracking-tight leading-tight text-white">
                Built to support the <span className="text-orange">next generation</span> of MBA talent
              </h2>
            </div>
            <div>
              <p className="text-cream/75 text-base mb-6">
                Embark India helps tier-2 MBA students prepare, compete, and get placed — with mentors who&apos;ve made the climb, competitions that build proof, and playbooks that map every stream.
              </p>
              <Link
                href="/mentorship"
                className="inline-flex items-center gap-3 bg-orange text-white font-semibold text-sm uppercase tracking-wider rounded-full px-8 py-4 hover:bg-orangeDeep transition"
              >
                Start your journey <span>→</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: "1,000+", l: "MBA aspirants reached" },
              { n: "150+", l: "Mentors & industry speakers" },
              { n: "100+", l: "MBA prep resources", accent: true },
              { n: "1,000+", l: "Curated opportunities" },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-white rounded-lg p-7 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition"
              >
                <span className="font-display font-extrabold text-3xl sm:text-4xl block text-orange">
                  {s.n}
                </span>
                <p className="text-sm text-charcoal mt-3">{s.l}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <ServiceStrip />

      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="relative bg-navy rounded-[34px] p-10 sm:p-14 text-center overflow-hidden">
            <svg
              className="absolute -left-16 -top-16 w-64 opacity-15 pointer-events-none"
              viewBox="0 0 260 240"
              aria-hidden="true"
            >
              <path
                fill="#2E6BFF"
                d="M186 14c38 20 72 56 68 92-3 37-44 74-88 85-44 12-90-3-116-34C24 126 20 78 41 47 63 15 110 1 143 3c17 1 31 5 43 11Z"
              />
            </svg>
            <svg
              className="absolute -right-20 -bottom-20 w-72 opacity-15 pointer-events-none"
              viewBox="0 0 300 270"
              aria-hidden="true"
            >
              <path
                fill="#2E6BFF"
                d="M246 27c35 27 57 73 49 112-8 40-46 73-90 86-45 13-95 6-125-22C50 175 40 126 55 86 69 46 107 16 150 9c37-6 70 0 96 18Z"
              />
            </svg>
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl mx-auto mb-4">
                Start before you <span className="text-orange">feel ready</span>.
              </h2>
              <p className="text-cream/70 max-w-md mx-auto mb-8">
                That&apos;s how every good MBA journey begins. Pick a door — the rest unfolds from there.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button href="/playbooks">Pick your stream</Button>
                <Button href="mailto:hello@embarkindia.in" variant="light">
                  Talk to us
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
