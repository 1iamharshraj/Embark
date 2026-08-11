"use client";

import { useMemo, useState } from "react";

const CATEGORIES = [
  {
    id: "industry-specific",
    title: "Industry-Specific Playbooks",
    desc: "Role and industry focused concepts, frameworks and interview questions.",
    img: "/assets/categories/industry-specific.jpg",
    accent: "#5B93E6",
    tintd: "rgba(13,31,60,.92)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        <path d="M9.5 8h.01M14.5 8h.01M9.5 12h.01M14.5 12h.01M10 21v-4h4v4" />
      </svg>
    ),
  },
  {
    id: "guesstimates",
    title: "Guesstimates",
    desc: "Structured approaches to estimation questions with clear examples.",
    img: "/assets/categories/guesstimates.jpg",
    accent: "#5FC08A",
    tintd: "rgba(11,44,30,.92)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" />
      </svg>
    ),
  },
  {
    id: "market-entry",
    title: "Market Entry Case Studies",
    desc: "Learn to evaluate new markets and entry strategies effectively.",
    img: "/assets/categories/market-entry.jpg",
    accent: "#7FA6FF",
    tintd: "rgba(8,42,40,.92)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.6 2.5 4 5.7 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.7-4-9s1.4-6.5 4-9Z" />
      </svg>
    ),
  },
  {
    id: "pricing",
    title: "Pricing Case Studies",
    desc: "Master pricing strategies and recommendations through real cases.",
    img: "/assets/categories/pricing.jpg",
    accent: "#5B8CFF",
    tintd: "rgba(32,24,20,.92)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.6 13.4 13 21a2 2 0 0 1-2.8 0L3 13.8V4h9.8Z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    ),
  },
  {
    id: "profitability",
    title: "Profitability Case Studies",
    desc: "Analyze profit drivers, identify issues and propose actionable solutions.",
    img: "/assets/categories/profitability.jpg",
    accent: "#7FA6FF",
    tintd: "rgba(46,15,17,.92)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <rect x="7" y="11" width="3" height="7" />
        <rect x="12" y="7" width="3" height="11" />
        <rect x="17" y="4" width="3" height="14" />
      </svg>
    ),
  },
];

const STEP = 64;

export default function PlaybookCategories() {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(CATEGORIES.map((_, i) => i));

  const stackStyle = useMemo(() => {
    const ordered = order.map((idx, pos) => ({
      idx,
      pos,
      zIndex: CATEGORIES.length - pos,
      transform: `translate(${pos * STEP}px, -50%) scale(${(1 - pos * 0.05).toFixed(3)})`,
      filter: `brightness(${(1 - pos * 0.13).toFixed(3)})`,
    }));
    return ordered;
  }, [order]);

  const next = () => setOrder((prev) => [...prev.slice(1), prev[0]]);
  const prev = () => setOrder((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);

  const ArrowIcon = (dir: "left" | "right") => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

  const ExploreIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );

  return (
    <section className={`cats ${open ? "open" : ""}`} id="cats" aria-label="Playbook categories">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Collapsed */}
        <div className="cats-collapsed">
          <div className="cats-intro">
            <p className="cats-eyebrow">Playbook categories</p>
            <h2 className="cats-h">Your complete interview preparation, organized your way.</h2>
            <p className="cats-p">
              Explore playbooks across essential case types and core business topics to strengthen your
              concepts and ace every interview.
            </p>
            <div className="cats-controls">
              <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
                See All Categories
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>
              <div className="cats-arrows">
                <button className="cats-arrow" type="button" aria-label="Previous category" onClick={prev}>
                  {ArrowIcon("left")}
                </button>
                <button className="cats-arrow" type="button" aria-label="Next category" onClick={next}>
                  {ArrowIcon("right")}
                </button>
              </div>
            </div>
          </div>
          <div className="cats-stack" aria-hidden="true">
            {CATEGORIES.map((cat, i) => {
              const layout = stackStyle.find((s) => s.idx === i);
              if (!layout) return null;
              return (
                <article
                  key={cat.id}
                  className="cat-card cursor-pointer"
                  style={{
                    zIndex: layout.zIndex,
                    transform: layout.transform,
                    filter: layout.filter,
                    ["--img" as string]: `url('${cat.img}')`,
                    ["--acc" as string]: cat.accent,
                    ["--tintd" as string]: cat.tintd,
                  }}
                  onClick={() => setOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setOpen(true);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Expanded */}
        <div className="cats-expanded">
          <div className="cats-open-head">
            <div>
              <p className="cats-eyebrow">Playbook categories</p>
              <h2 className="cats-h">Your complete interview preparation, organized your way.</h2>
            </div>
            <button
              className="cats-close"
              type="button"
              aria-label="Collapse categories"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="cats-grid">
            {CATEGORIES.map((cat) => (
              <article
                key={cat.id}
                className="cat-card"
                style={{
                  ["--img" as string]: `url('${cat.img}')`,
                  ["--acc" as string]: cat.accent,
                  ["--tintd" as string]: cat.tintd,
                }}
              >
                <div className="cat-body">
                  <span className="cat-ico" aria-hidden="true">
                    {cat.icon}
                  </span>
                  <h3 className="cat-title">{cat.title}</h3>
                  <span className="cat-rule" aria-hidden="true" />
                  <p className="cat-desc">{cat.desc}</p>
                  <a className="cat-explore" href="#explore-playbooks">
                    Explore {ExploreIcon}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
