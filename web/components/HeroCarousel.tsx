"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Container from "./Container";
import Button from "./Button";
import Eyebrow from "./Eyebrow";

const slides = [
  {
    eyebrow: "The platform",
    title: (
      <>
        Your MBA journey needs more than advice.
        <br />
        <span className="text-orange">It needs a roadmap.</span>
      </>
    ),
    sub: "Embark India helps tier-2 MBA students move from confusion to clarity — from college selection to case competitions, internships, and final placements.",
    primary: { label: "Start your MBA journey", href: "/mentorship" },
    secondary: { label: "Explore services", href: "#services" },
    visual: "roadmap",
    blob: { position: "top-right", fill: "#2E6BFF" },
  },
  {
    eyebrow: "Mentorship — the flagship",
    title: (
      <>
        Get mentored from college selection{" "}
        <span className="text-orange">to final placement</span>.
      </>
    ),
    sub: "Work with mentors who guide you across every major MBA milestone — choosing the right college, building your resume, preparing for summers, winning case competitions, and landing offers.",
    primary: { label: "Explore mentorship", href: "/mentorship" },
    secondary: { label: "Book free intro call", href: "/mentorship#intro" },
    visual: "mentor",
    blob: { position: "bottom-left", fill: "#2E6BFF" },
  },
  {
    eyebrow: "Proof-building",
    title: (
      <>
        Build proof that goes beyond{" "}
        <span className="text-orange">your college brand</span>.
      </>
    ),
    sub: "Participate in case competitions, use practical MBA playbooks, and earn credentials that strengthen your resume and help you stand out.",
    primary: { label: "View case competitions", href: "/competitions" },
    secondary: { label: "Explore playbooks", href: "/playbooks" },
    visual: "proof",
    blob: { position: "top-left", fill: "#0B1F3A" },
  },
  {
    eyebrow: "Opportunities",
    title: (
      <>
        Find opportunities. Meet industry experts.{" "}
        <span className="text-orange">Prepare better.</span>
      </>
    ),
    sub: "Get job and internship alerts, attend guest lectures, join career sessions, and stay connected to opportunities across industries.",
    primary: { label: "Explore opportunities", href: "/competitions" },
    secondary: { label: "Request a guest lecture", href: "/invite-an-expert" },
    visual: "feed",
    blob: { position: "bottom-right", fill: "#2E6BFF" },
  },
];

function RoadmapVisual() {
  const chips = [
    { label: "CAT score", left: 2, top: 335, delay: 0.15, dot: "orange" },
    { label: "MBA college", left: 120, top: 242, delay: 0.45, dot: "orange" },
    { label: "Resume", left: 212, top: 150, delay: 0.75, dot: "navy" },
    { label: "Case competition", left: 300, top: 300, delay: 1.05, dot: "navy" },
    { label: "Summer internship", left: 355, top: 190, delay: 1.35, dot: "orange" },
    { label: "Final placement", left: 388, top: 62, delay: 1.65, final: true },
  ];

  return (
    <div className="rmap">
      <svg viewBox="0 0 540 410" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="rm-path"
          d="M30 355 C 140 330, 90 240, 190 225 C 290 210, 260 300, 360 285 C 460 270, 420 130, 510 85"
        />
      </svg>
      {chips.map((c) => (
        <span
          key={c.label}
          className={`rm-chip ${c.final ? "final" : ""}`}
          style={{ left: c.left, top: c.top, transitionDelay: `${c.delay}s` }}
        >
          <span className="dot" />
          {c.label}
        </span>
      ))}
    </div>
  );
}

function MentorVisual() {
  const items = [
    { icon: "hat", label: "College selection", delay: 0.3, color: "o" },
    { icon: "doc", label: "Resume building", delay: 0.55, color: "g" },
    { icon: "clock", label: "Summer internship prep", delay: 0.8, color: "o" },
    { icon: "trophy", label: "Case competition support", delay: 1.05, color: "g" },
    { icon: "briefcase", label: "Final placement prep", delay: 1.3, color: "o" },
  ];

  return (
    <div className="dash">
      <div className="dash-head">
        <Image
          src="/assets/people/p2.jpg"
          alt=""
          width={46}
          height={46}
          className="w-[46px] h-[46px] rounded-[14px] object-cover flex-none"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          unoptimized
        />
        <div>
          <b>Your mentor</b>
          <small>Strategy lead · IIM A &apos;16</small>
        </div>
        <span className="dash-live">Your plan</span>
      </div>
      {items.map((it) => (
        <div
          key={it.label}
          className="dash-item"
          style={{ transitionDelay: `${it.delay}s` }}
        >
          <span className={`di di-${it.color}`}>
            {it.icon === "hat" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4 6 8-4 8 4-8 4-8-4z" />
                <path d="M4 6v6c0 2 3.6 4 8 4s8-2 8-4V6" />
              </svg>
            )}
            {it.icon === "doc" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M9 13h6M9 17h4" />
              </svg>
            )}
            {it.icon === "clock" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            )}
            {it.icon === "trophy" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            )}
            {it.icon === "briefcase" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            )}
          </span>
          {it.label}
          <span className="tickmark">✓</span>
        </div>
      ))}
    </div>
  );
}

function ProofVisual() {
  return (
    <div className="proofv">
      <div className="pf pf-comp" style={{ transitionDelay: "0.25s" }}>
        <small>Live · PPO track</small>
        <b>FMCG Growth Challenge</b>
        <small>3 rounds · 87 teams</small>
      </div>
      <div className="pf pf-deck" style={{ transitionDelay: "0.55s" }}>
        <small>Submission deck</small>
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
      </div>
      <div className="pf pf-cert" style={{ transitionDelay: "0.85s" }}>
        <small>Certificate of achievement</small>
        <b>National Finalist</b>
        <span className="seal">#1</span>
      </div>
      <div className="pf pf-badge" style={{ transitionDelay: "1.15s" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Resume badge earned
      </div>
      <div className="pf pf-li" style={{ transitionDelay: "1.45s" }}>
        <span className="in-ic">in</span>
        Shared to LinkedIn
      </div>
    </div>
  );
}

function FeedVisual() {
  const items = [
    { dot: "#2E6BFF", label: "Internship alert", time: "just now", delay: 0.3 },
    { dot: "#0B1F3A", label: "Marketing role · Mumbai", time: "2m", delay: 0.5 },
    { dot: "#B42318", label: "Finance role · Gurgaon", time: "8m", delay: 0.7 },
    { dot: "#5B8CFF", label: "Guest lecture · D2C brands", time: "14m", delay: 0.9 },
    { dot: "#2A3F7A", label: "Mock interview slot open", time: "21m", delay: 1.1 },
    { dot: "#0A66C2", label: "Industry session · Analytics", time: "32m", delay: 1.3 },
  ];

  return (
    <div className="feed">
      <div className="feed-head">
        <b>Opportunity feed</b>
        <span className="feed-live">Live</span>
      </div>
      {items.map((it) => (
        <div key={it.label} className="feed-item" style={{ transitionDelay: `${it.delay}s` }}>
          <span className="fdot" style={{ background: it.dot }} />
          {it.label}
          <small>{it.time}</small>
        </div>
      ))}
    </div>
  );
}

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef<number | null>(null);

  const go = (i: number) => {
    setIdx((i + slides.length) % slides.length);
  };

  const restart = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx((s) => (s + 1) % slides.length), 8000);
  };

  useEffect(() => {
    restart();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) {
      go(idx + (dx < 0 ? 1 : -1));
    }
    touchStart.current = null;
    restart();
  };

  const blobClass = (s: (typeof slides)[number]) => {
    const base = "hero-blob";
    if (s.blob.position === "top-right") return `${base} tr`;
    if (s.blob.position === "bottom-left") return `${base} bl`;
    if (s.blob.position === "top-left") return `${base} tl`;
    return `${base} br`;
  };

  return (
    <section
      className="hcar relative bg-cream overflow-hidden"
      id="start"
      aria-label="Highlights"
      onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
      onMouseLeave={restart}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hcar-track flex transition-transform duration-700 ease-[cubic-bezier(.3,.8,.3,1)]" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {slides.map((s, i) => (
          <section
            key={i}
            className={`hslide flex-none w-full relative overflow-hidden py-[72px] pb-[110px] ${i === idx ? "anim" : ""}`}
          >
            <svg
              className={blobClass(s)}
              style={{ fill: s.blob.fill }}
              viewBox="0 0 330 300"
              aria-hidden="true"
            >
              <path d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z" />
            </svg>
            <Container>
              <div className="hslide-wrap relative z-[1] grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-9 lg:gap-[52px] items-center">
                <div className="hs-copy">
                  <Eyebrow className="hs-eyebrow">{s.eyebrow}</Eyebrow>
                  <h1 className="font-display font-extrabold text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.08] tracking-tight text-charcoal">
                    {s.title}
                  </h1>
                  <p className="hs-sub">{s.sub}</p>
                  <div className="hs-ctas flex flex-wrap gap-3">
                    <Button href={s.primary.href}>{s.primary.label}</Button>
                    <Button href={s.secondary.href} variant="ghost">
                      {s.secondary.label}
                    </Button>
                  </div>
                </div>
                <div className="hs-visual relative min-h-[320px] lg:min-h-[430px] flex items-center">
                  {s.visual === "roadmap" && <RoadmapVisual />}
                  {s.visual === "mentor" && <MentorVisual />}
                  {s.visual === "proof" && <ProofVisual />}
                  {s.visual === "feed" && <FeedVisual />}
                </div>
              </div>
            </Container>
          </section>
        ))}
      </div>

      <div className="hcar-nav absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[5]">
        <button
          onClick={() => {
            go(idx - 1);
            restart();
          }}
          className="car-btn"
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>
        <div className="car-dots flex gap-2" role="tablist" aria-label="Slides">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                go(i);
                restart();
              }}
              className="car-dot"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === idx ? "true" : "false"}
            />
          ))}
        </div>
        <button
          onClick={() => {
            go(idx + 1);
            restart();
          }}
          className="car-btn"
          aria-label="Next slide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
