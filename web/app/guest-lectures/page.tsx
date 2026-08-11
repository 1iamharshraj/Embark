import type { Metadata } from "next";
import Container from "@/components/Container";
import Button from "@/components/Button";
import FAQ from "@/components/FAQ";
import GuestLecturesHero from "@/components/GuestLecturesHero";
import LogoMarquee from "@/components/LogoMarquee";
import FlipCards from "@/components/FlipCards";
import ExpertiseTabs from "@/components/ExpertiseTabs";
import HowItWorks from "@/components/HowItWorks";
import SpeakerCarousel from "@/components/SpeakerCarousel";

export const metadata: Metadata = {
  title: "Guest Lectures — Embark India",
  description:
    "Embark India connects institutes with verified industry experts for guest lectures, workshops and curriculum partnerships. Invite an expert, or become one.",
};

const faqItems = [
  {
    question: "What does it cost an institute?",
    answer:
      "You pay the speaker's honorarium, agreed upfront before you confirm. Our matching service is free during early access. No surprise charges after the session.",
  },
  {
    question: "How quickly can we get a speaker?",
    answer:
      "You'll receive a shortlist within 48 hours of posting a need. Most sessions are confirmed one to three weeks out, depending on the speaker's calendar and yours.",
  },
  {
    question: "How are speakers verified?",
    answer:
      "We confirm identity and current employment — government ID plus a work email or LinkedIn with employment proof. Your feedback after each session builds the quality record.",
  },
  {
    question: "What if the speaker isn't a fit for our batch?",
    answer:
      "Tell us at the shortlist stage and we'll send different names at no cost. If a confirmed session goes wrong, your review directly affects whether that speaker gets matched again.",
  },
  {
    question: "I'm a professional. What does joining cost?",
    answer:
      "Nothing. Listing, verification and invitations are free for professionals. You set your own honorarium expectations and can decline any invitation without penalty.",
  },
  {
    question: "Can we request a topic that isn't listed?",
    answer:
      "Yes. The verticals are where our bench is deepest, not a boundary. Describe what you need in the form and we'll match honestly — or tell you if we can't.",
  },
];

const commitments = [
  {
    n: "01",
    title: "Every speaker verified",
    desc: "Identity and employment checked before anyone is listed. No exceptions, no paid shortcuts.",
  },
  {
    n: "02",
    title: "Shortlist in 48 hours",
    desc: "Post a need on Monday; have names to evaluate by Wednesday. Speed is part of the service.",
  },
  {
    n: "03",
    title: "Free for professionals",
    desc: "Listing, verification and invitations cost speakers nothing. You set your own honorarium expectations.",
  },
  {
    n: "04",
    title: "Online or on campus",
    desc: "Both formats, every vertical — you choose what fits the batch, the budget and the calendar.",
  },
];

export default function GuestLecturesPage() {
  return (
    <>
      <GuestLecturesHero />
      <LogoMarquee />
      <FlipCards />
      <ExpertiseTabs />
      <HowItWorks />

      <section className="commit bg-gradient-to-b from-navy to-navyDeep text-white py-[52px] lg:py-[58px]" aria-label="Our commitments">
        <Container>
          <div className="max-w-[560px] mb-8">
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8FB0FF] mb-2">
              <span className="w-8 border-t-2 border-dashed border-[#2E6BFF]" aria-hidden="true" />
              Our commitments
            </span>
            <h2 className="font-display font-extrabold text-[clamp(1.8rem,3.2vw,2.5rem)] leading-[1.1] tracking-tight text-white mb-3">
              Promises we actually keep.
            </h2>
            <p className="text-cream/60 text-base leading-relaxed">
              The guardrails behind every match — not marketing lines, just how the service works.
            </p>
          </div>
          <div className="commit-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {commitments.map((c) => (
              <div
                key={c.n}
                className="commit-card relative bg-cream/5 border border-cream/10 rounded-[18px] p-6 transition hover:bg-cream/10 hover:-translate-y-1.5 hover:border-[#8FB0FF]/50"
              >
                <span className="commit-n absolute top-[18px] right-5 font-display font-extrabold text-[1.05rem] text-[#8FB0FF]/30" aria-hidden="true">
                  {c.n}
                </span>
                <div className="commit-ic w-[50px] h-[50px] rounded-[14px] bg-gradient-to-br from-orange to-orangeDeep flex items-center justify-center mb-4 shadow-[0_10px_22px_rgba(46,107,255,0.35)] transition group-hover:-translate-y-0.5 group-hover:-rotate-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white">
                    {c.n === "01" && (
                      <>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </>
                    )}
                    {c.n === "02" && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </>
                    )}
                    {c.n === "03" && <path d="M20 6 9 17l-5-5" />}
                    {c.n === "04" && (
                      <>
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </>
                    )}
                  </svg>
                </div>
                <h3 className="font-display font-bold text-[1.08rem] text-white mb-2">{c.title}</h3>
                <p className="text-[0.86rem] leading-[1.55] text-cream/70">{c.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SpeakerCarousel />

      <section className="glfaq bg-cream py-8 lg:py-12" id="faq">
        <Container>
          <div className="glfaq-grid grid lg:grid-cols-[0.82fr_1.18fr] gap-12 lg:gap-12 items-start">
            <div>
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-green mb-2">
                <span className="w-8 border-t-2 border-dashed border-green" aria-hidden="true" />
                Questions, answered plainly
              </span>
              <h2 className="font-display font-extrabold text-[clamp(1.9rem,3.2vw,2.55rem)] leading-[1.08] tracking-tight text-charcoal mb-4">
                Frequently asked questions
              </h2>
              <p className="text-inkSoft text-base leading-relaxed max-w-[330px] mb-6">
                Everything institutes and speakers ask before their first session. Still unsure? We&apos;ll answer straight.
              </p>
              <div className="glfaq-cta bg-gradient-to-br from-navy to-navyDeep rounded-[18px] p-5 sm:p-6 text-white">
                <h3 className="font-display font-bold text-[1.15rem] mb-1.5">Still have a question?</h3>
                <p className="text-cream/70 text-[0.86rem] leading-relaxed mb-4">
                  Tell us what you need and we&apos;ll get you a clear answer — usually the same day.
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
                Industry belongs in the timetable.
              </h2>
              <p className="text-cream/70 max-w-md mx-auto mb-8">
                Whether you need a speaker or want to become one, it starts with one form.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button href="/invite-an-expert">Invite an expert</Button>
                <Button href="/become-a-speaker" variant="light">
                  Become a speaker
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
