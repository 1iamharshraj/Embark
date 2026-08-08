import type { Metadata } from "next";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import FAQ from "@/components/FAQ";
import Section from "@/components/Section";

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

const formats = [
  {
    title: "Guest lecture",
    desc: "A 90-minute deep dive on one topic, tied to what the batch is studying that term.",
  },
  {
    title: "Webinar series",
    desc: "Online and recurring — a vertical covered end-to-end across four to six sessions.",
  },
  {
    title: "Workshop & live case",
    desc: "Students work a real, sanitised problem from the speaker's desk — and defend their answers.",
  },
  {
    title: "Curriculum partner",
    desc: "A practitioner reviews your course outline against what industry actually hires for.",
  },
  {
    title: "Visiting faculty",
    desc: "A recurring engagement across the term — industry in the core timetable, not just events.",
  },
];

export default function GuestLecturesPage() {
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
            <Eyebrow className="justify-center">Guest lectures</Eyebrow>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
              Bring verified industry practitioners
              <br />
              <span className="text-orange">into your classroom</span>.
            </h1>
            <p className="text-lg text-inkSoft max-w-2xl mx-auto mb-8">
              Embark India connects institutes with verified experts for guest lectures, workshops,
              webinar series and curriculum partnerships — without the cold-outreach grind.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/invite-an-expert">Invite an expert</Button>
              <Button href="/become-a-speaker" variant="ghost">
                Become a speaker
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section eyebrow="Formats" title="Every shape of industry input." centered>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {formats.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] hover:-translate-y-1 transition text-left"
            >
              <h3 className="font-display font-bold text-lg text-charcoal mb-2">{f.title}</h3>
              <p className="text-sm text-inkSoft leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        dark
        eyebrow="How it works"
        title="You describe the class. We find the speaker."
        centered
      >
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              n: "01",
              title: "Tell us your need",
              desc: "Topic, batch, format, dates and budget — one short form. That's the whole ask.",
            },
            {
              n: "02",
              title: "Approve the match",
              desc: "We send a shortlist of verified practitioners who fit your brief. You pick; we coordinate the rest.",
            },
            {
              n: "03",
              title: "Host the lecture",
              desc: "Online or on campus. Afterwards, your feedback goes on the speaker's record — trust that compounds.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition text-left"
            >
              <span className="text-xs font-bold text-orange tracking-widest">{s.n}</span>
              <h3 className="font-display font-bold text-lg text-white mt-3 mb-2">{s.title}</h3>
              <p className="text-sm text-cream/70 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Our commitments" title="Promises we actually keep." centered>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "Every speaker verified",
              desc: "Identity and employment checked before anyone is listed. No exceptions, no paid shortcuts.",
            },
            {
              title: "Shortlist in 48 hours",
              desc: "Post a need on Monday; have names to evaluate by Wednesday. Speed is part of the service.",
            },
            {
              title: "Free for professionals",
              desc: "Listing, verification and invitations cost speakers nothing. You set your own honorarium expectations.",
            },
            {
              title: "Online or on campus",
              desc: "Both formats, every vertical — you choose what fits the batch, the budget and the calendar.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-cream rounded-2xl p-6 border border-charcoal/8 hover:-translate-y-1 transition text-left"
            >
              <h3 className="font-display font-bold text-base text-charcoal mb-2">{c.title}</h3>
              <p className="text-sm text-inkSoft leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-12 items-start">
            <div>
              <Eyebrow>Questions, answered plainly</Eyebrow>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
                Frequently asked questions
              </h2>
              <p className="text-inkSoft mb-6">
                Everything institutes and speakers ask before their first session.
              </p>
              <div className="bg-navy rounded-2xl p-6 text-white">
                <h3 className="font-display font-bold text-lg mb-2">Still have a question?</h3>
                <p className="text-sm text-cream/70 mb-4">
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
