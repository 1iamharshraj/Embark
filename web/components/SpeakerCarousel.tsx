"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const speakers = [
  {
    name: "Kavitha Venkat",
    role: "Marketing leader, consumer tech",
    img: "/assets/people/p1.jpg",
    quote:
      "The sharpest questions I face all year come from a classroom in its second term. Guest lecturing keeps my own thinking honest.",
  },
  {
    name: "Abhinav Rathi",
    role: "Strategy lead, financial services",
    img: "/assets/people/p2.jpg",
    quote:
      "Someone gave me an hour of their experience when I was a student in a Tier 2 college. This is me returning it — with interest.",
  },
  {
    name: "Shruti Nambiar",
    role: "Analytics director, e-commerce",
    img: "/assets/people/p3.jpg",
    quote: "One lecture turned into three workshops and two interns for my team. Campuses are where I scout talent now.",
  },
  {
    name: "Rohan Malhotra",
    role: "Supply chain head, quick commerce",
    img: "/assets/people/p4.jpg",
    quote: "Textbooks are five years behind my warehouse. Ninety minutes with students closes that gap in both directions.",
  },
  {
    name: "Divya Krishnan",
    role: "Product director, fintech",
    img: "/assets/people/p5.jpg",
    quote: "I hire better because I teach. Watching a batch argue through a case tells me more than a hundred resumes.",
  },
  {
    name: "Vivek Iyer",
    role: "Sales head, e-commerce",
    img: "/assets/people/p8.jpg",
    quote: "Selling to a hall of sceptical second-years is the best objection-handling practice on the market.",
  },
];

export default function SpeakerCarousel() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const v = window.innerWidth <= 640 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
      setVisible(v);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIdx = Math.max(0, speakers.length - visible);

  const go = (i: number) => {
    setIdx(Math.max(0, Math.min(i, maxIdx)));
  };

  const restart = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(idx >= maxIdx ? 0 : idx + 1), 5500);
  };

  useEffect(() => {
    restart();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, maxIdx, visible]);

  useEffect(() => {
    if (idx > maxIdx) setIdx(maxIdx);
  }, [maxIdx, idx]);

  return (
    <section className="spot bg-white py-16 sm:py-20 lg:py-24" id="spotlights">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="max-w-[640px] mb-[30px]">
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-green mb-4">
            <span className="w-8 border-t-2 border-dashed border-green" aria-hidden="true" />
            Speaker spotlights
          </span>
          <h2 className="font-display font-bold text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight text-charcoal">
            Why professionals keep coming back.
          </h2>
        </div>

        <div
          className="car"
          onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
          onMouseLeave={restart}
        >
          <div className="car-view overflow-hidden mx-[-4px] p-1">
            <div
              ref={trackRef}
              className="car-track flex gap-5 transition-transform duration-500 ease-[cubic-bezier(.22,.8,.3,1)]"
              style={{
                transform: `translateX(-${idx * (100 / visible + 1.6)}%)`,
              }}
            >
              {speakers.map((s) => (
                <div
                  key={s.name}
                  className="car-slide flex-none"
                  style={{ width: `calc((100% - 40px) / ${visible})`, minWidth: "280px" }}
                >
                  <div className="spot-card bg-cream rounded-[22px] p-6 h-full flex flex-col border border-charcoal/8 shadow-[0_12px_30px_rgba(22,22,22,0.06)]">
                    <div className="spot-top flex items-center gap-3.5 mb-4">
                      <Image
                        src={s.img}
                        alt={s.name}
                        width={66}
                        height={66}
                        className="spot-photo w-[66px] h-[66px] rounded-[18px] object-cover flex-none shadow-[0_0_0_3px_#fff]"
                        unoptimized
                      />
                      <div>
                        <b className="block font-display font-bold text-base text-charcoal leading-tight">{s.name}</b>
                        <span className="block text-[0.82rem] text-inkSoft">{s.role}</span>
                      </div>
                    </div>
                    <p className="spot-quote text-[0.95rem] leading-relaxed text-charcoal/80 italic font-serif before:content-['\\201C'] before:block before:font-display before:font-extrabold before:text-[2.1rem] before:leading-[0.55] before:text-orange before:mb-2.5">
                      {s.quote}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="car-nav flex items-center justify-center gap-[18px] mt-8">
            <button
              className="car-btn"
              aria-label="Previous speakers"
              onClick={() => {
                go(idx === 0 ? maxIdx : idx - 1);
                restart();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <div className="car-dots flex gap-2" role="tablist" aria-label="Speaker slides">
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`car-dot ${i === idx ? "active" : ""}`}
                  aria-label={`Position ${i + 1}`}
                  aria-current={i === idx ? "true" : "false"}
                  onClick={() => {
                    go(i);
                    restart();
                  }}
                />
              ))}
            </div>
            <button
              className="car-btn"
              aria-label="Next speakers"
              onClick={() => {
                go(idx >= maxIdx ? 0 : idx + 1);
                restart();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
