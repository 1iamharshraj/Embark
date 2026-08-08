import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import FAQ from "@/components/FAQ";
import CompetitionCard from "@/components/CompetitionCard";
import Section from "@/components/Section";

export const metadata: Metadata = {
  title: "Case Competitions — Embark India",
  description:
    "Live and upcoming MBA case competitions built for real career outcomes. Register solo or as a team, submit within timed rounds, track results — with coaching to help you win.",
};

function compStatus(now: Date, regOpen: Date, regClose: Date, endAt: Date) {
  if (now < regOpen) return "Upcoming";
  if (now >= regOpen && now <= regClose) return "Live";
  if (now > regClose && now < endAt) return "Running";
  return "Closed";
}

const categories = [
  { name: "Marketing Strategy", img: "/assets/categories/marketing.jpg" },
  { name: "Finance & Valuation", img: "/assets/categories/finance.jpg" },
  { name: "Consulting & Case Solving", img: "/assets/categories/consulting.jpg" },
  { name: "Product Management", img: "/assets/categories/product.jpg" },
  { name: "Analytics & AI", img: "/assets/categories/analytics.jpg" },
  { name: "General Management", img: "/assets/categories/genmgmt.jpg" },
  { name: "Entrepreneurship", img: "/assets/categories/entrepreneur.jpg" },
  { name: "Operations & Supply Chain", img: "/assets/categories/operations.jpg" },
  { name: "HR Strategy", img: "/assets/categories/hr.jpg" },
  { name: "Business Quiz", img: "/assets/categories/quiz.jpg" },
];

const faqItems = [
  {
    question: "Can I participate alone?",
    answer:
      "Yes, some competitions allow solo participation. Others may require teams depending on the rules — the team size is shown on every competition card.",
  },
  {
    question: "Can I register as a team?",
    answer: "Yes, the team lead can register and add teammates during registration.",
  },
  {
    question: "Are competitions free or paid?",
    answer:
      "Some competitions are free, while others may require a small registration fee. The fee is always shown upfront on the card and the details page.",
  },
  {
    question: "How do submissions work?",
    answer:
      "Each round has a deadline. Teams upload their submission before the round closes — the details page shows every round's window and status.",
  },
  {
    question: "How are results decided?",
    answer:
      "Judging happens offline. The platform shows round status, advancement, and final results once updated.",
  },
  {
    question: "Can I get help preparing my submission?",
    answer:
      "Yes — Embark India offers case competition coaching and playbooks to help you prepare a stronger submission.",
  },
];

export default async function CompetitionsPage() {
  const now = new Date();
  const raw = await prisma.competition.findMany({
    where: { draft: false },
    orderBy: { regOpen: "asc" },
  });

  const competitions = raw.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    banner: c.banner,
    fee: c.fee,
    status: compStatus(now, c.regOpen, c.regClose, c.endAt),
  }));

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 lg:py-24">
        <svg
          className="absolute -top-32 -right-32 w-80 opacity-90 pointer-events-none"
          viewBox="0 0 330 300"
          aria-hidden="true"
        >
          <path
            fill="#2E6BFF"
            d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z"
          />
        </svg>
        <Container>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Eyebrow className="justify-center">Case competitions</Eyebrow>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
              Compete in MBA case challenges built for
              <span className="text-orange"> real career outcomes</span>.
            </h1>
            <p className="text-lg text-inkSoft max-w-2xl mx-auto mb-8">
              Explore live and upcoming case competitions designed for MBA students to solve business problems, sharpen thinking, and strengthen placement readiness.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="#competitions">Explore competitions</Button>
              <Button href="#coaching" variant="ghost">
                Get case comp coaching
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="competitions" className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-2xl mb-10">
            <Eyebrow>Live & upcoming</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Competitions open now.
            </h2>
            <p className="text-inkSoft">
              Register solo or as a team. Each card shows the fee, status and category upfront.
            </p>
          </div>
          {competitions.length === 0 ? (
            <div className="text-center py-12 bg-cream rounded-2xl">
              <p className="text-inkSoft">No competitions open right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((c) => (
                <CompetitionCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  category={c.category}
                  banner={c.banner}
                  fee={c.fee}
                  status={c.status}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="relative overflow-hidden bg-navy py-16 sm:py-20 lg:py-24 text-cream">
        <Container>
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-center mb-12">
            <div>
              <Eyebrow className="text-orange">Why here</Eyebrow>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
                Why compete on Embark India
              </h2>
              <p className="text-cream/70 mb-6">
                Built for MBA students who want practical challenges, sharper preparation, and stronger career visibility.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white border border-orange/50 rounded-full px-4 py-2">
                <svg
                  className="w-4 h-4 text-orange"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                Built for real outcomes
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  title: "Built for MBA students",
                  desc: "Real business challenges across major MBA domains.",
                  color: "from-blue-500/20 to-blue-500/5",
                },
                {
                  title: "Designed for tier-2 talent",
                  desc: "A platform for students who want proof beyond brand.",
                  color: "from-emerald-400/20 to-emerald-400/5",
                },
                {
                  title: "Guidance available",
                  desc: "Coaching, playbooks, and mentor support to improve submissions.",
                  color: "from-purple-400/20 to-purple-400/5",
                },
                {
                  title: "Career-oriented challenges",
                  desc: "Designed around internships, PPOs, and placements.",
                  color: "from-orange-400/20 to-orange-400/5",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`bg-gradient-to-br ${card.color} border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition`}
                >
                  <h3 className="font-display font-bold text-lg text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-cream/70">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Section eyebrow="Every stream" title="Competition categories" centered>
        <p className="text-inkSoft max-w-2xl mx-auto mb-10">
          Ten arenas across every MBA specialisation — your stream is always in play.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="relative aspect-square rounded-2xl overflow-hidden group"
            >
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition duration-500 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-navy/20" />
              <span className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm leading-snug">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <section id="coaching" className="bg-navy py-16 sm:py-20 lg:py-24 text-cream">
        <Container>
          <div className="max-w-2xl mb-10">
            <Eyebrow className="text-orange">Win, not just participate</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Need help building a stronger case submission?
            </h2>
            <p className="text-cream/70">
              Get mentor-led support for problem structuring, research, slide design, storytelling, and presentation readiness.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {[
              "Case understanding session",
              "Research & framework guidance",
              "Deck structure review",
              "Storyline & slide feedback",
              "Final presentation practice",
            ].map((s, i) => (
              <div
                key={s}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
              >
                <span className="text-xs font-bold text-orange tracking-widest block mb-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display font-bold text-base text-white">{s}</h3>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Button href="/mentorship">Get case comp coaching</Button>
            <Button href="/playbooks" variant="light">
              Explore case playbooks
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-12 items-start">
            <div>
              <Eyebrow>Good to know</Eyebrow>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
                Frequently asked questions
              </h2>
              <p className="text-inkSoft mb-6">
                Everything you need before entering your first case competition.
              </p>
              <div className="bg-navy rounded-2xl p-6 text-white">
                <h3 className="font-display font-bold text-lg mb-2">Still have a question?</h3>
                <p className="text-sm text-cream/70 mb-4">
                  Tell us what you&apos;re unsure about and we&apos;ll get you a clear answer — usually the same day.
                </p>
                <Button href="mailto:hello@embarkindia.in" variant="light">
                  Talk to us →
                </Button>
              </div>
            </div>
            <FAQ items={faqItems} />
          </div>
        </Container>
      </section>
    </>
  );
}
