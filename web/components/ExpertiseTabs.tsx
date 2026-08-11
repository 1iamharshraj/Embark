"use client";

import { useState } from "react";

const formats = [
  {
    title: "Guest lecture",
    desc: "A 90-minute deep dive on one topic, tied to what the batch is studying that term. The classic, done properly — brief, speaker, feedback, all handled.",
    feature: true,
    ghost: "90'",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h20v13H2z" />
        <path d="M8 21h8M12 16v5" />
        <path d="M7 8h6M7 11h4" />
      </svg>
    ),
  },
  {
    title: "Webinar series",
    desc: "Online and recurring — a vertical covered end-to-end across four to six sessions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
      </svg>
    ),
  },
  {
    title: "Workshop & live case",
    desc: "Students work a real, sanitised problem from the speaker's desk — and defend their answers.",
    green: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a5 5 0 1 0-5.4 8.2L9 22l3-2 3 2-.3-7.5a5 5 0 0 0 0-8.2z" transform="translate(0 -1)" />
      </svg>
    ),
  },
  {
    title: "Curriculum partner",
    desc: "A practitioner reviews your course outline against what industry actually hires for.",
    dark: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5V6a2 2 0 0 1 2-2h14v13.5" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v4H6.5A2.5 2.5 0 0 1 4 18.5Z" />
        <path d="M9 8h7" />
      </svg>
    ),
  },
  {
    title: "Visiting faculty",
    desc: "A recurring engagement across the term — industry in the core timetable, not just events.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 9h18" />
        <path d="m10 14 2 2 4-4" transform="translate(0 1)" />
      </svg>
    ),
  },
];

const verticals: Record<string, string[]> = {
  Marketing: ["D2C brand building", "Digital marketing ROI", "Brand positioning", "Go-to-market for Bharat"],
  Sales: ["B2B sales cycles", "Key account management", "SaaS sales playbooks", "Channel & distribution"],
  Communication: ["Executive presence", "Storytelling with data", "Crisis communication", "Writing that gets read"],
  Statistics: ["A/B testing in practice", "Regression beyond the textbook", "Forecasting demand", "Sampling & survey design"],
  Finance: ["Valuation on a real deal", "Startup fundraising", "Corporate finance cases", "Risk in Indian markets"],
  Analytics: ["SQL to insight", "Marketing mix modelling", "People analytics", "Dashboards leaders actually read"],
  Economics: ["Behavioural economics at work", "India macro for managers", "Game theory in pricing", "Platform economics"],
  "Supply chain": ["Quick-commerce logistics", "S&OP in practice", "Procurement negotiations", "Warehouse to doorstep"],
  "Market Research": ["Consumer insight methods", "Qual vs quant, honestly", "Pricing research", "Concept testing"],
  Entrepreneurship: ["Zero to one in India", "Unit economics that survive", "The fundraising narrative", "First ten hires"],
  Consulting: ["Problem structuring", "Case cracking, from a caser", "Managing the client", "Slide-craft that persuades"],
  Strategy: ["Market entry decisions", "Competitive moats", "Platform strategy", "Corporate strategy in conglomerates"],
  "Product Management": ["Roadmaps under constraint", "Metrics that matter", "PM interviews, from the panel", "Building for the next billion"],
  "Project Management": ["Agile at enterprise scale", "Stakeholder management", "Risk registers that work", "Delivery under deadline"],
};

const bubbles = [
  { v: "Marketing", x: 4, y: 6, s: 150, c: "b-orange" },
  { v: "Sales", x: 20, y: 0, s: 112, c: "b-gsoft" },
  { v: "Communication", x: 30, y: 26, s: 104, c: "b-line" },
  { v: "Analytics", x: 41, y: 2, s: 136, c: "b-green" },
  { v: "Statistics", x: 55, y: 24, s: 100, c: "b-soft" },
  { v: "Finance", x: 65, y: 0, s: 142, c: "b-dark" },
  { v: "Economics", x: 80, y: 20, s: 106, c: "b-gsoft" },
  { v: "Strategy", x: 86, y: 40, s: 128, c: "b-orange" },
  { v: "Market Research", x: 6, y: 52, s: 112, c: "b-dark" },
  { v: "Entrepreneurship", x: 19, y: 62, s: 124, c: "b-green" },
  { v: "Supply chain", x: 34, y: 58, s: 118, c: "b-soft" },
  { v: "Consulting", x: 48, y: 54, s: 126, c: "b-gsoft" },
  { v: "Product Management", x: 62, y: 46, s: 134, c: "b-soft" },
  { v: "Project Management", x: 76, y: 64, s: 116, c: "b-line" },
];

export default function ExpertiseTabs() {
  const [tab, setTab] = useState<"engage" | "verticals">("engage");
  const [activeVert, setActiveVert] = useState("Marketing");

  return (
    <section className="expert-sec bg-white py-16 sm:py-20 lg:py-24" id="expertise">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="max-w-[640px] mb-[42px]">
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-green mb-4">
            <span className="w-8 border-t-2 border-dashed border-green" aria-hidden="true" />
            An expert for every occasion
          </span>
          <h2 className="font-display font-bold text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight text-charcoal mb-4">
            Pick the format. Pick the subject.
          </h2>
          <p className="text-[1.05rem] text-inkSoft">
            From a single 90-minute lecture to a semester-long partnership — across fourteen management disciplines.
          </p>
        </div>

        <div className="tabs inline-flex gap-1.5 bg-cream rounded-full p-1.5 mb-[42px]" role="tablist" aria-label="Ways to engage or areas of expertise">
          <button
            className={`tab-btn rounded-full px-6 py-2.5 text-[0.94rem] font-semibold transition ${
              tab === "engage" ? "bg-charcoal text-cream" : "text-inkSoft hover:text-charcoal"
            }`}
            role="tab"
            aria-selected={tab === "engage"}
            onClick={() => setTab("engage")}
          >
            Ways to engage
          </button>
          <button
            className={`tab-btn rounded-full px-6 py-2.5 text-[0.94rem] font-semibold transition ${
              tab === "verticals" ? "bg-charcoal text-cream" : "text-inkSoft hover:text-charcoal"
            }`}
            role="tab"
            aria-selected={tab === "verticals"}
            onClick={() => setTab("verticals")}
          >
            Areas of expertise
          </button>
        </div>

        {tab === "engage" && (
          <div role="tabpanel" aria-label="Ways to engage">
            <div className="bento grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px] grid-auto-rows-[190px] lg:grid-auto-rows-[200px]">
              {formats.map((f) => {
                const base =
                  "bento-card relative overflow-hidden rounded-2xl p-7 flex flex-col justify-end transition hover:-translate-y-[5px] hover:shadow-[0_12px_32px_rgba(22,22,22,0.12)]";
                const theme = f.feature
                  ? "bento-feature lg:row-span-2 bg-orange text-white col-span-1 sm:col-span-2 lg:col-span-1"
                  : f.green
                  ? "bento-green bg-[#E7EDF6]"
                  : f.dark
                  ? "bento-dark bg-charcoal text-cream"
                  : "bg-cream";
                return (
                  <div key={f.title} className={`${base} ${theme}`}>
                    {f.feature && <span className="ghost">{f.ghost}</span>}
                    <span className="bento-icon">{f.icon}</span>
                    {!f.feature && (
                      <span className="bento-go absolute top-6 right-6 text-inkSoft opacity-50">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[18px] h-[18px]">
                          <path d="M7 17 17 7M8 7h9v9" />
                        </svg>
                      </span>
                    )}
                    <h3 className={`font-display font-bold text-[1.15rem] mb-1.5 ${f.feature ? "text-white" : f.dark ? "text-white" : "text-charcoal"}`}>
                      {f.title}
                    </h3>
                    <p className={`text-[0.88rem] leading-relaxed ${f.feature ? "text-white/90" : f.dark ? "text-cream/70" : "text-inkSoft"}`}>
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "verticals" && (
          <div role="tabpanel" aria-label="Areas of expertise">
            <p className="bubble-hint text-center text-[0.85rem] text-inkSoft mb-2">
              Fourteen disciplines. Tap any bubble to see sample lecture topics.
            </p>
            <div className="bubble-stage relative h-[500px] hidden md:block" role="tablist" aria-label="Expertise verticals">
              {bubbles.map((b, i) => {
                const fs = b.s >= 140 ? "1.02rem" : b.s >= 118 ? "0.92rem" : "0.8rem";
                const delay = (i % 7) * -1.1;
                return (
                  <button
                    key={b.v}
                    className={`bubble ${b.c} ${activeVert === b.v ? "ring-4 ring-cream ring-offset-2 ring-offset-orange" : ""}`}
                    role="tab"
                    aria-selected={activeVert === b.v}
                    data-v={b.v}
                    onClick={() => setActiveVert(b.v)}
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.s}px`,
                      height: `${b.s}px`,
                      fontSize: fs,
                      animationDelay: `${delay}s`,
                    }}
                  >
                    {b.v}
                  </button>
                );
              })}
            </div>
            <div className="verticals flex flex-wrap gap-2.5 mb-6 md:hidden" role="tablist" aria-label="Expertise verticals">
              {Object.keys(verticals).map((n) => (
                <button
                  key={n}
                  className={`vert-chip px-5 py-2.5 rounded-full text-[0.92rem] font-medium transition ${
                    activeVert === n ? "bg-orange text-white" : "bg-cream text-charcoal border-[1.5px] border-transparent hover:border-charcoal/30"
                  }`}
                  role="tab"
                  aria-selected={activeVert === n}
                  onClick={() => setActiveVert(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="vert-detail bg-navy rounded-2xl p-8 sm:p-9 flex flex-col gap-3 min-h-[150px]">
              <h3 className="text-white font-display font-bold text-[1.25rem]">{activeVert}</h3>
              <ul className="vert-topics flex flex-wrap gap-2">
                {verticals[activeVert].map((t) => (
                  <li key={t} className="text-cream text-[0.9rem] bg-cream/10 border border-cream/20 rounded-full px-4 py-1.5">
                    {t}
                  </li>
                ))}
              </ul>
              <p className="text-cream/60 text-[0.84rem]">
                A sample of lecture topics — every engagement is scoped to your batch and syllabus.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
