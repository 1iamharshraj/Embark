"use client";

import { useState } from "react";

const cards = [
  {
    theme: "orange",
    ghost: "01",
    metric: "Admissions season",
    front: "Enrolment",
    back: "Prospective students compare campuses by who shows up there. A timetable with real practitioners on it is proof you can screenshot — and admissions teams know it.",
  },
  {
    theme: "dark",
    ghost: "02",
    metric: "Inside the classroom",
    front: "Engagement",
    back: "A framework taught by someone who used it last quarter lands differently. Students stay past the hour for the war stories — and remember them in exams.",
  },
  {
    theme: "green",
    ghost: "03",
    metric: "Placement season",
    front: "Employability",
    back: "Every speaker is a working professional with a team and a hiring budget. Lectures quietly become internships, live projects and pre-placement conversations.",
  },
];

export default function FlipCards() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <section className="why bg-cream py-16 sm:py-20 lg:py-24" id="why">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="max-w-[640px] mb-[52px]">
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-green mb-4">
            <span className="w-8 border-t-2 border-dashed border-green" aria-hidden="true" />
            Why institutes do this
          </span>
          <h2 className="font-display font-bold text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight text-charcoal mb-4">
            One good lecture moves three numbers.
          </h2>
          <p className="text-[1.05rem] text-inkSoft">
            Industry connect isn&apos;t a garnish on the curriculum — it shows up where directors are measured. Flip each card.
          </p>
        </div>

        <div className="flip-grid grid md:grid-cols-3 gap-[22px] perspective-[1400px]">
          {cards.map((c, i) => {
            const isFlipped = flipped === i;
            const themeClass =
              c.theme === "orange" ? "f-orange" : c.theme === "dark" ? "f-dark" : "f-green";
            return (
              <button
                key={i}
                type="button"
                className={`flip ${themeClass} group relative h-[280px] md:h-[330px] cursor-pointer bg-transparent border-none p-0 text-left font-inherit rounded-[26px] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange`}
                aria-label={`${c.front} — flip for details`}
                onClick={() => setFlipped(isFlipped ? null : i)}
              >
                <span
                  className={`flip-inner absolute inset-0 preserve-3d transition-transform duration-[650ms] ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <span
                    className="flip-face flip-front absolute inset-0 rounded-[26px] p-8 flex flex-col justify-between overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="ghost" aria-hidden="true">{c.ghost}</span>
                    <span className="why-metric">{c.metric}</span>
                    <span>
                      <h3 className="font-display font-extrabold text-[2.1rem] text-white leading-none mb-3">{c.front}</h3>
                      <span className="flip-hint inline-flex items-center gap-2 text-sm text-white/75">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M21 12a9 9 0 1 1-9-9" />
                          <path d="M21 3v6h-6" />
                        </svg>
                        Flip to see how
                      </span>
                    </span>
                  </span>
                  <span
                    className="flip-face flip-back absolute inset-0 rounded-[26px] p-8 flex flex-col justify-center gap-3"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="font-display font-bold text-[1.3rem] text-white">{c.front}</h3>
                    <p className="text-[0.97rem] leading-relaxed text-white/90">{c.back}</p>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
