"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    stars: 5,
    title: "Marketing playbook made revision much easier",
    quote:
      "I had my summer placement interview in two days and this helped me revise the important concepts quickly. The examples were simple, practical, and much better than going through scattered notes.",
    name: "Aishwarya Menon",
    meta: "IIM Tiruchirappalli · Marketing Playbook",
  },
  {
    stars: 5,
    title: "Very useful before consulting shortlists",
    quote:
      "What I liked most was the clarity. The frameworks were organised well, and I could actually understand how to use them in interview answers instead of just memorising definitions.",
    name: "Rohit Bansal",
    meta: "IIM Udaipur · Consulting Playbook",
  },
  {
    stars: 5,
    title: "Helped me structure my answers better",
    quote:
      "I was comfortable with the concepts, but I used to struggle while answering in interviews. This playbook made my responses more structured and helped me speak with more confidence.",
    name: "Sneha Kulkarni",
    meta: "IIM Raipur · Strategy Playbook",
  },
  {
    stars: 5,
    title: "Great for last-minute preparation",
    quote:
      "I used the Finance playbook just before my placement process and it was genuinely helpful. It covered the important topics without feeling too heavy, and the format made revision fast.",
    name: "Aditya Prakash",
    meta: "IIM Ranchi · Finance Playbook",
  },
  {
    stars: 5,
    title: "Finally felt my preparation was in one place",
    quote:
      "Earlier I was switching between class notes, PDFs and random websites. This gave me one clean resource to prepare from, especially for guesstimates and case-based questions.",
    name: "Neha Agarwal",
    meta: "IIM Kashipur · Guesstimates Playbook",
  },
];

const TINTS: [string, string][] = [
  ["#FFE9DF", "#C93A05"],
  ["#E7EDF6", "#0B1F3A"],
  ["#FDECE3", "#C93A05"],
  ["#E7EDF6", "#0B1F3A"],
  ["#EFE9DE", "#161616"],
];

function avatarSvg(name: string, i: number) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const [bg, fg] = TINTS[i % TINTS.length];
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
    `<rect width='100' height='100' rx='16' fill='${bg}'/>` +
    `<text x='50' y='50' dy='.35em' text-anchor='middle' font-family='Inter,Arial,sans-serif' font-size='40' font-weight='700' fill='${fg}'>${initials}</text>` +
    `</svg>`;
  return "data:image/svg+xml;utf8," + svg;
}

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getVisible = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 3;
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS.length - visible);

  useEffect(() => {
    const onResize = () => {
      setVisible(getVisible());
      setCurrent((prev) => Math.min(prev, Math.max(0, TESTIMONIALS.length - getVisible())));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getVisible]);

  useEffect(() => {
    setCurrent((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const go = useCallback((i: number) => {
    setCurrent(i > maxIndex ? 0 : i < 0 ? maxIndex : i);
  }, [maxIndex]);

  const start = useCallback(() => {
    if (timerRef.current || maxIndex === 0) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        return next;
      });
    }, 4500);
  }, [maxIndex]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) start();
    return () => stop();
  }, [maxIndex, start, stop]);

  const ArrowIcon = (dir: "left" | "right") => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "left" ? (
        <>
          <path d="M19 12H5" />
          <path d="M11 18l-6-6 6-6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </>
      )}
    </svg>
  );

  return (
    <section className="pbk tst">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <p className="eyebrow tst-kicker">What students say</p>
        <div className="tst-top">
          <h2>Don&apos;t just take our word for it.</h2>
          <div className="tst-nav">
            <button
              className="tst-arrow primary"
              type="button"
              aria-label="Previous testimonials"
              onClick={() => {
                go(current - 1);
                stop();
                start();
              }}
            >
              {ArrowIcon("left")}
            </button>
            <button
              className="tst-arrow secondary"
              type="button"
              aria-label="Next testimonials"
              onClick={() => {
                go(current + 1);
                stop();
                start();
              }}
            >
              {ArrowIcon("right")}
            </button>
          </div>
        </div>
        <div
          className="tst-slider"
          ref={sliderRef}
          onMouseEnter={stop}
          onMouseLeave={start}
          onFocus={stop}
          onBlur={start}
        >
          <div
            className="tst-track"
            style={{
              transform: `translateX(-${current * (100 / visible + 20 / (visible * 320))}%)`,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <article key={i} className="tst-card">
                <div className="tst-head">
                  <div className="tst-avatar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={t.name} src={avatarSvg(t.name, i)} />
                  </div>
                  <div className="tst-meta">
                    <h3 className="tst-name">{t.name}</h3>
                    <p className="tst-sub">{t.meta}</p>
                  </div>
                  <div className="tst-mark" aria-hidden="true">
                    &ldquo;
                  </div>
                </div>
                <p className="tst-stars" aria-label={`${t.stars} out of 5 stars`}>
                  {"★".repeat(t.stars)}
                </p>
                <h4 className="tst-rtitle">{t.title}</h4>
                <p className="tst-text">{t.quote}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="tst-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              className="tst-dot"
              aria-current={i === current}
              aria-label={`Show testimonial group ${i + 1}`}
              onClick={() => {
                go(i);
                stop();
                start();
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
