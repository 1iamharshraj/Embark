"use client";

const colleges = [
  { name: "IMT Ghaziabad", loc: "Delhi NCR", avg: "17.3", hi: "64" },
  { name: "Great Lakes Institute", loc: "Chennai", avg: "14.6", hi: "42" },
  { name: "XIM University", loc: "Bhubaneswar", avg: "17.5", hi: "71" },
  { name: "Welingkar (WeSchool)", loc: "Mumbai", avg: "11.7", hi: "40" },
  { name: "K J Somaiya", loc: "Mumbai", avg: "13.3", hi: "33" },
  { name: "TAPMI", loc: "Manipal", avg: "13.5", hi: "32" },
  { name: "FORE School", loc: "New Delhi", avg: "16.0", hi: "45" },
  { name: "GIM", loc: "Goa", avg: "14.8", hi: "39" },
];

export default function CollegesMarquee() {
  const duplicated = [...colleges, ...colleges];

  return (
    <section className="bg-white py-11 lg:py-12 overflow-hidden" aria-label="College spotlight">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center mb-6">
        <span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-orangeDeep bg-orangeSoft border border-orange/30 rounded-full px-4 py-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M3 20h18M5 20V12l4-3 4 4 6-6v13" />
          </svg>
          College spotlight
        </span>
      </div>
      <div
        className="relative overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)",
          maskImage: "linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)",
        }}
      >
        <div className="flex gap-4 w-max animate-[colslide_40s_linear_infinite] hover:[animation-play-state:paused] py-2">
          {duplicated.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="flex-none w-[250px] bg-white rounded-2xl p-4 shadow-[0_6px_20px_rgba(11,31,58,0.08)] flex flex-col gap-3 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(11,31,58,0.14)] transition"
            >
              <div className="flex gap-3 items-center">
                <span className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center flex-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
                    <path d="M3 21h18M4 21V9l8-5 8 5v12" />
                    <path d="M9 21v-6h6v6M12 9h.01" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <b className="block text-sm font-bold text-charcoal leading-tight">{c.name}</b>
                  <span className="inline-flex items-center gap-1 text-xs text-inkSoft mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3 h-3 text-orange">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {c.loc}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-2 bg-[#F4F6FA] rounded-xl py-2.5">
                <div className="text-center px-2">
                  <small className="block text-[0.64rem] font-semibold tracking-wide text-inkSoft mb-0.5">Avg package</small>
                  <b className="block font-display font-extrabold text-base text-navy">{c.avg}</b>
                </div>
                <div className="text-center px-2 border-l border-charcoal/10">
                  <small className="block text-[0.64rem] font-semibold tracking-wide text-inkSoft mb-0.5">Highest</small>
                  <b className="block font-display font-extrabold text-base text-orange">{c.hi}</b>
                </div>
              </div>
              <a
                href="/playbooks"
                className="inline-flex items-center justify-center gap-2 bg-orange text-white text-xs font-semibold rounded-xl py-2.5 hover:bg-orangeDeep transition"
              >
                View details
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-3.5 h-3.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
