"use client";

import { useState } from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import FAQ from "@/components/FAQ";
import MentorCard from "@/components/MentorCard";
import Link from "next/link";

interface Mentor {
  id: string;
  slug: string;
  name: string;
  image: string;
  role: string;
  company: string;
  college: string;
  batch: string;
  tier: string;
  phases: number[];
  streams: string[];
  rating: number;
  sessions: number;
  years: number;
  price: number;
  guestLectures: boolean;
  expertise: string[];
  bio: string;
  reviewText: string;
  reviewWho: string;
}

const phases = [
  {
    n: 1,
    name: "Get into the right college",
    label: "Aspirant · calls to converts",
    outcome: "Calls converted, not just received",
    includes: [
      "College list built on your percentile, goals and honest ROI — not brand fog",
      "WAT and SOP drafting with real edits, not templates",
      "Resume built for admissions panels",
      "Mock PI panels with alumni of your target colleges",
      "Call strategy: which converts to chase, which to let go",
    ],
  },
  {
    n: 2,
    name: "Start strong",
    label: "First year · first 90 days",
    outcome: "A first year that compounds",
    includes: [
      "Club and committee selection — the two that compound, not the five that don't",
      "CV foundation from week one, so nothing is retrofitted later",
      "Academic prioritisation: where grades gate shortlists and where they don't",
      "A network map: the seniors, professors and alumni worth knowing early",
    ],
  },
  {
    n: 3,
    name: "Win your summers",
    label: "First year · Day-0 season",
    outcome: "A summer that ends with an offer",
    includes: [
      "CV freeze prep — your points sharpened before the shortlist deadline",
      "Company selection: where your profile actually converts, not just where queues form",
      "Sector-specific mock interviews and GD drills",
      "The 8-week internship plan — because PPOs are won during the summer, not after",
      "Weekly check-ins through the internship, aimed at the conversion",
    ],
  },
  {
    n: 4,
    name: "Win case competitions",
    label: "Both years · comp season",
    outcome: "Podiums that become offers",
    includes: [
      "Competition calendar: which comps carry PPO weight for your stream",
      "Team formation and role clarity before the first deck",
      "Stage-by-stage coaching — screening deck, semis story, finals delivery",
      "Finals Q&A rehearsal with mentors who judge these competitions",
      "Converting a podium into interview conversations",
    ],
  },
  {
    n: 5,
    name: "Land your final placement",
    label: "Final year · the last climb",
    outcome: "An offer you chose, not settled for",
    includes: [
      "Final CV narrative: two years of work compressed into one coherent story",
      "Company-specific interview prep with role-holders",
      "Mock panels calibrated to your shortlists — as many rounds as it takes",
      "Offer evaluation and negotiation support",
      "Backup planning, so Day 2 has a strategy too",
    ],
  },
];

const stories = [
  {
    phase: 1,
    headline: "91.4 %ile, three calls, one convert — the right one",
    quote: "My mentor made me drop two 'safe' calls and rebuild WAT prep for the one that mattered. Converted IIM Indore.",
    who: "Aspirant cohort '25",
  },
  {
    phase: 3,
    headline: "A summer built around one metric, converted at HUL",
    quote: "Week two, my mentor asked: what number does your guide report upward? We built my whole internship around it. PPO.",
    who: "First-year cohort '25",
  },
  {
    phase: 4,
    headline: "First-ever finals, then two in one season",
    quote: "Stage-wise deck coaching changed everything. The finals Q&A rehearsal predicted four of the judges' five questions.",
    who: "Case comp team '26",
  },
  {
    phase: 5,
    headline: "Day-1 offer after nine mock panels",
    quote: "By panel nine I'd heard every version of 'walk me through your CV'. The real one felt like a formality.",
    who: "Final-year cohort '25",
  },
  {
    phase: 2,
    headline: "Two committees, zero regrets",
    quote: "The unpopular advice — skip the glamour committee — gave me a CV line with a budget on it. It came up in every interview.",
    who: "First-year cohort '26",
  },
  {
    phase: 1,
    headline: "From 'reapply next year' to a seat this year",
    quote: "Coaching said my profile was weak. My mentor found the story in it. The panel spent 15 minutes on exactly that story.",
    who: "Aspirant cohort '26",
  },
];

const faqItems = [
  {
    question: "What does a mentorship session actually cover?",
    answer: "You bring one specific problem — a call convert strategy, a summer prep plan, a case-comp deck, or a final-placement mock. The mentor helps you structure the next steps, and you leave with a written plan.",
  },
  {
    question: "How is a mentor matched to me?",
    answer: "We look at your stage, stream, and specific ask, then recommend the mentor whose background and recent track record fit best. You can also browse and book any mentor directly.",
  },
  {
    question: "Is the intro call really free?",
    answer: "Yes. Twenty minutes, no pressure. We hear where you are, tell you honestly what would help, and you decide from there.",
  },
  {
    question: "Can I switch mentors or upgrade to the full journey?",
    answer: "Yes. Most students start with one session and upgrade once they feel the difference. The full journey bundles every phase with one dedicated mentor relationship.",
  },
];

function IntroForm() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="bg-white rounded-[30px] shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10 max-w-3xl mx-auto">
      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="grid sm:grid-cols-2 gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Your name</label>
            <input required type="text" className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Email</label>
            <input required type="email" className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-charcoal">WhatsApp number</label>
            <input required type="tel" className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-charcoal">When works for you?</label>
            <input type="text" placeholder="Weekday evenings / Sunday morning — we'll confirm on WhatsApp" className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition" />
          </div>
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <small className="text-xs text-inkSoft">Confirmation lands on email and WhatsApp. Reschedule anytime.</small>
            <Button type="submit">Book my free call</Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-navySoft text-navy flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-2xl text-charcoal mb-2">Call requested</h3>
          <p className="text-sm text-inkSoft max-w-md mx-auto">
            We&apos;ll confirm a slot on WhatsApp and email within one working day. Meanwhile, pick your stream playbook — it makes the call twice as useful.
          </p>
        </div>
      )}
    </div>
  );
}

export default function MentorshipPage({ mentors }: { mentors: Mentor[] }) {
  const [filter, setFilter] = useState<"all" | number>("all");
  const filtered =
    filter === "all" ? mentors : mentors.filter((m) => m.phases.includes(filter));

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 lg:py-24">
        <svg className="absolute -top-32 -right-32 w-80 opacity-90 pointer-events-none" viewBox="0 0 330 300" aria-hidden="true">
          <path fill="#2E6BFF" d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z" />
        </svg>
        <svg className="absolute -bottom-32 -left-32 w-72 opacity-40 pointer-events-none" viewBox="0 0 300 270" aria-hidden="true">
          <path fill="#2E6BFF" d="M246 27c35 27 57 73 49 112-8 40-46 73-90 86-45 13-95 6-125-22C50 175 40 126 55 86 69 46 107 16 150 9c37-6 70 0 96 18Z" />
        </svg>
        <Container>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Eyebrow className="justify-center">The flagship — end-to-end mentorship</Eyebrow>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
              From CAT result to final offer,
              <br />
              <span className="text-orange">you&apos;re not climbing alone</span>.
            </h1>
            <p className="text-lg text-inkSoft max-w-2xl mx-auto mb-8">
              One mentorship journey across your entire MBA — the right college, the right start, a summer that converts, competitions that count, and a final offer you chose.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="#intro">Book a free intro call</Button>
              <Button href="#mentors" variant="ghost">Browse mentors</Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-inkSoft">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Mentors from IIM A/B/C, XLRI, ISB & FMS
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Every phase, one journey
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Intro call is free, always
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Eyebrow className="justify-center">The journey</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Five phases. One climb. Zero gaps.
            </h2>
            <p className="text-inkSoft">This is not a menu of services — it&apos;s one continuous journey.</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[6%] right-[6%] border-t-2 border-dashed border-green/45" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {phases.map((p) => (
                <div key={p.n} className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-cream border-2 border-dashed border-charcoal/30 flex items-center justify-center font-display font-extrabold text-xl text-charcoal z-10">
                    {p.n}
                  </div>
                  <b className="font-display font-bold text-base text-charcoal">{p.name}</b>
                  <small className="text-xs text-inkSoft">{p.label}</small>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-3xl mb-12">
            <Eyebrow>What&apos;s inside</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Phase by phase.
            </h2>
            <p className="text-inkSoft">Each phase has a clear outcome and a set of concrete deliverables.</p>
          </div>
          <div className="grid gap-6">
            {phases.map((p) => (
              <div
                key={p.n}
                className="bg-white rounded-[28px] shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10 grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orangeDeep mb-2">
                    Phase {p.n} · {p.label}
                  </p>
                  <h3 className="font-display font-bold text-2xl text-charcoal mb-3">{p.name}</h3>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy bg-navySoft rounded-full px-4 py-1.5 mb-5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Outcome: {p.outcome}
                  </span>
                  <ul className="grid gap-3">
                    {p.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-3 text-sm text-charcoal">
                        <svg className="w-5 h-5 text-orange flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-cream rounded-2xl p-6">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-inkSoft mb-4">
                    Who handles this phase
                  </h4>
                  <p className="text-sm text-inkSoft">
                    Mentors from the bench who have cleared this exact milestone — recent alumni for fresh formats and industry professionals for the hard mocks.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy text-cream py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Eyebrow className="justify-center text-orange">Outcomes, not promises</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              What the journey actually produces.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((s) => (
              <div
                key={s.headline}
                className="bg-white/5 border border-white/15 rounded-[22px] p-7 flex flex-col gap-4 hover:bg-white/10 transition"
              >
                <span className="self-start text-xs font-semibold uppercase tracking-wider text-orange border border-orange/50 rounded-full px-3 py-1">
                  Phase {s.phase} · {phases[s.phase - 1].name}
                </span>
                <h3 className="font-display font-bold text-lg text-white leading-snug">{s.headline}</h3>
                <blockquote className="font-serif italic text-sm text-cream/75 leading-relaxed">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <span className="text-xs text-cream/55 mt-auto">— {s.who}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="mentors" className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-2xl mb-10">
            <Eyebrow>The bench</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Browse mentors by where you need them.
            </h2>
            <p className="text-inkSoft">Seniors and recent alumni for the fresh intel; industry professionals for the rooms they now run.</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { f: "all", label: "All mentors" },
              { f: 1, label: "Admissions" },
              { f: 2, label: "First year" },
              { f: 3, label: "Summers" },
              { f: 4, label: "Case comps" },
              { f: 5, label: "Final placement" },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setFilter(b.f as typeof filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
                  filter === b.f
                    ? "bg-orange text-white"
                    : "bg-cream text-charcoal hover:border-charcoal/30 border border-transparent"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m) => (
              <MentorCard
                key={m.id}
                slug={m.slug}
                name={m.name}
                image={m.image}
                role={m.role}
                company={m.company}
                college={m.college}
                batch={m.batch}
                expertise={m.expertise}
                rating={m.rating}
                sessions={m.sessions}
                tier={m.tier}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Eyebrow className="justify-center">How it&apos;s packaged</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Start small, or take the whole journey.
            </h2>
            <p className="text-inkSoft">Same mentors either way — only the packaging differs.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-5 items-stretch">
            <div className="bg-cream rounded-3xl p-8 flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Start here</span>
              <h3 className="font-display font-bold text-xl text-charcoal">Single sessions</h3>
              <p className="text-sm text-inkSoft">Book any mentor directly from their profile — one session, one specific problem.</p>
              <ul className="grid gap-2 text-sm text-charcoal mt-2">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Pay per session, mentor-set price</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>No commitment</li>
              </ul>
              <div className="mt-auto pt-4 font-display font-bold text-lg text-charcoal">
                ₹699–1,999 <small className="block font-body font-normal text-xs text-inkSoft">per session, set by each mentor</small>
              </div>
            </div>
            <div className="bg-charcoal text-cream rounded-3xl p-8 flex flex-col gap-4 lg:scale-[1.02] shadow-[0_18px_44px_rgba(22,22,22,0.3)]">
              <span className="self-start text-xs font-semibold uppercase tracking-wider text-white bg-orange rounded-full px-3 py-1">The flagship</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-orange">End to end</span>
              <h3 className="font-display font-bold text-xl text-white">The Journey</h3>
              <p className="text-sm text-cream/70">All five phases, one dedicated mentor relationship, every service woven in.</p>
              <ul className="grid gap-2 text-sm text-cream/85 mt-2">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-orange flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Dedicated mentor + phase specialists</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-orange flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Mocks, case-comp coaching, placement prep included</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-orange flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Generous fair-use — built for real journeys</li>
              </ul>
              <div className="mt-auto pt-4 font-display font-bold text-lg text-white">
                Priced on your intro call <small className="block font-body font-normal text-xs text-cream/60">founding cohort gets founding terms</small>
              </div>
            </div>
            <div className="bg-cream rounded-3xl p-8 flex flex-col gap-4 opacity-75">
              <span className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Coming soon</span>
              <h3 className="font-display font-bold text-xl text-charcoal">Prep packs</h3>
              <p className="text-sm text-inkSoft">Capped bundles for one job to be done — a pack of 5 mock interviews, or support across 5 case competitions.</p>
              <ul className="grid gap-2 text-sm text-charcoal mt-2">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Fixed scope, fixed price</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Lives on the Prep & Coaching page</li>
              </ul>
              <div className="mt-auto pt-4 font-display font-bold text-lg text-charcoal">
                Launching soon <small className="block font-body font-normal text-xs text-inkSoft">waitlist via the intro call</small>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-inkSoft mt-8 max-w-2xl mx-auto">
            Open and honest: journey pricing isn&apos;t final yet. Every intro call gets the current founding-cohort terms in writing before you decide anything.
          </p>
        </Container>
      </section>

      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-12 items-start">
            <div>
              <Eyebrow>Questions, answered plainly</Eyebrow>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
                Frequently asked questions
              </h2>
              <p className="text-inkSoft mb-6">Everything students ask before their first session.</p>
              <div className="bg-navy rounded-2xl p-6 text-white">
                <h3 className="font-display font-bold text-lg mb-2">Still have a question?</h3>
                <p className="text-sm text-cream/70 mb-4">Tell us what you need and we&apos;ll get you a clear answer — usually the same day.</p>
                <Link href="mailto:hello@embarkindia.in" className="inline-flex items-center gap-2 bg-orange text-navy font-bold text-sm rounded-xl px-5 py-3 hover:bg-white transition">
                  Talk to us →
                </Link>
              </div>
            </div>
            <FAQ items={faqItems} />
          </div>
        </Container>
      </section>

      <section id="intro" className="bg-cream py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Eyebrow className="justify-center">Free intro call</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Twenty minutes. Zero pressure.
            </h2>
            <p className="text-inkSoft">We hear where you are, tell you honestly what would help — even if the answer is &ldquo;just read the playbook&rdquo; — and you decide from there.</p>
          </div>
          <IntroForm />
        </Container>
      </section>
    </>
  );
}
