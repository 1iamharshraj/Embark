"use client";

const steps = [
  {
    chip: "2 minutes",
    ghost: "1",
    title: "Tell us your need",
    desc: "Topic, batch, format, dates and budget — one short form. That's the whole ask.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    tilt: "tilt-l",
  },
  {
    chip: "Within 48 hours",
    ghost: "2",
    title: "Approve the match",
    desc: "We send a shortlist of verified practitioners who fit your brief. You pick; we coordinate the rest.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7.5" r="3.5" />
        <path d="m16 11 2 2 4-4" />
      </svg>
    ),
    tilt: "tilt-r",
  },
  {
    chip: "Lecture day",
    ghost: "3",
    title: "Host the lecture",
    desc: "Online or on campus. Afterwards, your feedback goes on the speaker's record — trust that compounds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h20v13H2z" />
        <path d="M8 21h8M12 16v5" />
        <path d="m9 7 5 2.5L9 12z" />
      </svg>
    ),
    tilt: "tilt-l",
  },
];

export default function HowItWorks() {
  return (
    <section className="how bg-cream py-16 sm:py-20 lg:py-24" id="how">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="max-w-[640px] mb-[42px]">
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-green mb-4">
            <span className="w-8 border-t-2 border-dashed border-green" aria-hidden="true" />
            How it works
          </span>
          <h2 className="font-display font-bold text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight text-charcoal">
            You describe the class. We find the speaker.
          </h2>
        </div>

        <div className="how-cards grid md:grid-cols-3 gap-[30px] relative pt-4">
          <div className="how-connect hidden md:block absolute top-[52%] left-[6%] right-[6%] border-t-[2.5px] border-dashed border-navy opacity-35" aria-hidden="true" />
          {steps.map((s) => (
            <div
              key={s.ghost}
              className={`how-card relative z-[1] bg-white rounded-3xl p-8 sm:p-[38px_30px_32px] shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden transition hover:rotate-0 hover:-translate-y-2 group ${s.tilt}`}
            >
              <span className="how-chip absolute top-[18px] right-[22px] text-[0.76rem] font-semibold bg-orangeSoft text-orangeDeep rounded-full px-3 py-1">
                {s.chip}
              </span>
              <span className="ghost absolute -bottom-8 right-1.5 font-display font-extrabold text-[7.5rem] leading-none text-transparent pointer-events-none select-none">
                {s.ghost}
              </span>
              <div className="how-icon w-[54px] h-[54px] rounded-2xl bg-navy text-white flex items-center justify-center mb-5">
                {s.icon}
              </div>
              <h3 className="font-display font-bold text-[1.24rem] text-charcoal mb-2">{s.title}</h3>
              <p className="text-[0.93rem] text-inkSoft leading-relaxed relative z-[1]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
