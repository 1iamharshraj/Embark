"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Container from "./Container";

const items = [
  { title: "Competitions", art: "trophy", href: "/competitions", bg: "linear-gradient(150deg,#DCE7FF 0%,#8FB0FF 100%)" },
  { title: "Mock interviews & GD", art: "mic", href: null, bg: "linear-gradient(150deg,#DDEEC6 0%,#C2E09E 100%)" },
  { title: "Industry Playbooks", art: "books", href: "/playbooks", bg: "linear-gradient(150deg,#E9F0FE 0%,#D6E2FF 100%)" },
  { title: "End-to-end mentorship", art: "mountain", href: "/mentorship", bg: "linear-gradient(150deg,#DCE7FF 0%,#B8CCFF 100%)" },
  { title: "Courses", art: "play", href: null, bg: "linear-gradient(150deg,#DCE7FF 0%,#B8CCFF 100%)" },
  { title: "Jobs & Internships", art: "briefcase", href: null, bg: "linear-gradient(150deg,#D2EAF7 0%,#AFD9EE 100%)" },
  { title: "College hub", art: "college", href: null, bg: "linear-gradient(150deg,#D4EFE5 0%,#B4E2D1 100%)" },
  { title: "Quizzes", art: "quiz", href: null, bg: "linear-gradient(150deg,#DCE7FF 0%,#B8CCFF 100%)" },
  { title: "Workshops", art: "workshop", href: null, bg: "linear-gradient(150deg,#E5EDFF 0%,#CFDCFF 100%)" },
];

const artSvgs: Record<string, JSX.Element> = {
  trophy: (
    <g transform="scale(0.9) translate(12,12)">
      <rect x="8" y="30" width="60" height="44" rx="6" fill="#1A1E28" />
      <path d="M26 44l-8 8 8 8M42 44l8 8-8 8" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="24" y="74" width="28" height="7" rx="3" fill="#9CA3AF" />
      <path d="M60 26h24v14a12 12 0 0 1-24 0z" fill="#2E6BFF" />
      <path d="M60 30h-7a7 7 0 0 0 7 10M84 30h7a7 7 0 0 1-7 10" stroke="#2E6BFF" strokeWidth="5" fill="none" />
      <rect x="67" y="50" width="10" height="12" fill="#2E6BFF" />
      <rect x="60" y="62" width="24" height="7" rx="3" fill="#5B8CFF" />
    </g>
  ),
  mic: (
    <g transform="scale(0.9) translate(12,12)">
      <rect x="10" y="18" width="44" height="30" rx="12" fill="#FFFFFF" />
      <circle cx="24" cy="33" r="3" fill="#1A1E28" />
      <circle cx="33" cy="33" r="3" fill="#1A1E28" />
      <circle cx="42" cy="33" r="3" fill="#1A1E28" />
      <path d="M20 48l-4 10 12-8" fill="#FFFFFF" />
      <rect x="58" y="26" width="20" height="34" rx="10" fill="#1A1E28" />
      <path d="M52 50a16 16 0 0 0 32 0" stroke="#1A1E28" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M68 68v12M56 82h24" stroke="#1A1E28" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  books: (
    <g transform="scale(0.9) translate(12,12)">
      <rect x="14" y="58" width="66" height="14" rx="4" fill="#0B1F3A" />
      <rect x="20" y="42" width="56" height="14" rx="4" fill="#2E6BFF" />
      <rect x="27" y="26" width="44" height="14" rx="4" fill="#1A1E28" />
      <rect x="34" y="30" width="18" height="4" rx="2" fill="#FFFFFF" opacity="0.8" />
      <rect x="28" y="46" width="18" height="4" rx="2" fill="#FFFFFF" opacity="0.8" />
      <rect x="22" y="62" width="18" height="4" rx="2" fill="#FFFFFF" opacity="0.7" />
    </g>
  ),
  mountain: (
    <g transform="scale(0.9) translate(12,12)">
      <path d="M8 82L38 30l16 26 10-14 22 40z" fill="#0B1F3A" />
      <path d="M38 30l7 12-7 6-8-5z" fill="#FFFFFF" />
      <path d="M64 26V10l14 5-14 6" fill="#2E6BFF" />
      <rect x="61" y="8" width="4" height="22" rx="2" fill="#1A1E28" />
      <path d="M14 78c14-8 26-4 34-16" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="5 6" fill="none" strokeLinecap="round" />
    </g>
  ),
  play: (
    <g transform="scale(0.9) translate(12,12)">
      <rect x="12" y="18" width="64" height="48" rx="10" fill="#1A1E28" />
      <path d="M38 32l18 10-18 10z" fill="#2E6BFF" />
      <rect x="24" y="74" width="40" height="7" rx="3" fill="#9CA3AF" />
      <path d="M78 46l14-14M86 50l10-10" stroke="#5B8CFF" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  briefcase: (
    <g transform="scale(0.9) translate(12,12)">
      <rect x="14" y="34" width="68" height="44" rx="9" fill="#1A1E28" />
      <path d="M36 34v-8a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v8" stroke="#1A1E28" strokeWidth="6" fill="none" />
      <rect x="14" y="50" width="68" height="6" fill="#2E6BFF" />
      <rect x="42" y="48" width="12" height="12" rx="3" fill="#FFFFFF" />
    </g>
  ),
  college: (
    <g transform="scale(0.9) translate(12,12)">
      <path d="M12 38L48 16l36 22z" fill="#0B1F3A" />
      <rect x="20" y="42" width="8" height="26" fill="#1A1E28" />
      <rect x="36" y="42" width="8" height="26" fill="#1A1E28" />
      <rect x="52" y="42" width="8" height="26" fill="#1A1E28" />
      <rect x="68" y="42" width="8" height="26" fill="#1A1E28" />
      <rect x="12" y="70" width="72" height="8" rx="3" fill="#0B1F3A" />
      <circle cx="48" cy="30" r="4" fill="#5B8CFF" />
    </g>
  ),
  quiz: (
    <g transform="scale(0.85) translate(16,16)">
      <rect x="16" y="14" width="46" height="58" rx="9" fill="#FFFFFF" transform="rotate(-6 39 43)" />
      <text x="34" y="52" fontFamily="Arial" fontSize="34" fontWeight="bold" fill="#1A1E28" transform="rotate(-6 39 43)">?</text>
      <circle cx="70" cy="62" r="17" fill="#2E6BFF" />
      <path d="M62 62l6 6 11-12" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  workshop: (
    <g transform="scale(0.9) translate(12,12)">
      <rect x="16" y="16" width="60" height="42" rx="6" fill="#FFFFFF" />
      <path d="M24 48l12-14 9 8 14-18" stroke="#2E6BFF" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 58L26 82M58 58l8 24M46 58v14" stroke="#1A1E28" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
};

function Blob() {
  const d = "M142 8c34 14 58 48 52 78-6 31-42 56-78 58-36 3-72-18-82-48C24 66 42 30 70 14 92 2 120 0 142 8Z";
  return (
    <>
      <svg className="absolute -top-12 -right-12 w-48 h-auto pointer-events-none" viewBox="0 0 200 160" aria-hidden="true">
        <path fill="rgba(255,255,255,0.5)" d={d} />
      </svg>
      <svg className="absolute -bottom-12 -left-12 w-32 h-auto pointer-events-none" viewBox="0 0 200 160" aria-hidden="true">
        <path fill="rgba(255,255,255,0.38)" d={d} />
      </svg>
      <svg className="absolute left-5 bottom-20 w-14 h-auto pointer-events-none" viewBox="0 0 60 30" aria-hidden="true">
        <path d="M2 26C18 4 40 30 58 8" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </>
  );
}

export default function ServiceStrip() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const cards = Array.from(strip.querySelectorAll<HTMLElement>(".pcard"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      cards.forEach((c) => c.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            cards.forEach((c, i) => setTimeout(() => c.classList.add("in-view"), i * 90));
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(strip);
    return () => observer.disconnect();
  }, []);

  const scrollBy = (dir: number) => {
    stripRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section id="services" className="bg-white py-16 sm:py-20 lg:py-24 overflow-hidden">
      <Container>
        <div className="flex items-end justify-between gap-5 flex-wrap mb-4">
          <div>
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3">
              <span className="w-8 border-t-2 border-dashed border-green" aria-hidden="true" />
              The full climb
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">Nine ways up.</h2>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => scrollBy(-1)}
              className="w-11 h-11 rounded-full border border-charcoal/15 bg-white text-charcoal flex items-center justify-center hover:border-charcoal transition"
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="w-11 h-11 rounded-full border border-charcoal/15 bg-white text-charcoal flex items-center justify-center hover:border-charcoal transition"
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </Container>

      <div
        ref={stripRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 lg:px-8 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((it) => {
          const content = (
            <>
              <Blob />
              <h3 className="relative z-10 font-display font-extrabold text-2xl leading-tight tracking-tight max-w-[82%]">
                {it.title}
              </h3>
              <svg
                className="absolute right-4 bottom-3.5 w-28 h-28 pointer-events-none drop-shadow-[0_8px_10px_rgba(22,22,22,0.18)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                {artSvgs[it.art]}
              </svg>
              {it.href && (
                <span className="absolute left-6 bottom-5 z-10 inline-flex items-center gap-2 text-xs font-semibold text-[#14171F] bg-white/80 rounded-full px-4 py-2 group-hover:bg-[#14171F] group-hover:text-white transition">
                  Explore
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-3.5 h-3.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              )}
            </>
          );

          const cardClass =
            "pcard group relative flex-none w-[300px] h-[190px] rounded-[28px] p-6 pb-5 overflow-hidden snap-start no-underline text-[#14171F] transition-all duration-500";

          if (it.href) {
            return (
              <Link key={it.title} href={it.href} className={cardClass} style={{ background: it.bg }}>
                {content}
              </Link>
            );
          }
          return (
            <span key={it.title} className={cardClass} style={{ background: it.bg }}>
              {content}
            </span>
          );
        })}
      </div>
    </section>
  );
}
