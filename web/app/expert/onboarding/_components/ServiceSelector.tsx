"use client";

const SERVICES = [
  {
    key: "1:1 Mentorship",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    description: "One-on-one sessions with students",
    price: "₹1,499 · 30 min",
  },
  {
    key: "Quick chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    description: "Short 15-min catch-up calls",
    price: "₹499 · 15 min",
  },
  {
    key: "Resume review",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    description: "Detailed resume feedback",
    price: "₹1,499 · 30 min",
  },
  {
    key: "Career guidance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    description: "Long-term career roadmapping",
    price: "₹1,499 · 30 min",
  },
  {
    key: "Interview prep",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    description: "Case, HR and placement interview practice",
    price: "₹1,499 · 30 min",
  },
  {
    key: "Discovery Call",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l.49-.49a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.32 17z" />
      </svg>
    ),
    description: "Free introductory call",
    price: "Free · 30 min",
  },
  {
    key: "Mock interview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    description: "Full mock interview simulation",
    price: "₹2,499 · 60 min",
  },
  {
    key: "Priority DM",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    description: "Written Q&A with guaranteed response",
    price: "₹999 · async",
  },
  {
    key: "Ask me anything",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    description: "Open-ended async question slot",
    price: "₹999 · async",
  },
];

interface ServiceSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ServiceSelector({ selected, onChange }: ServiceSelectorProps) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {SERVICES.map((svc) => {
        const active = selected.includes(svc.key);
        return (
          <button
            key={svc.key}
            type="button"
            onClick={() => toggle(svc.key)}
            className={`group relative text-left rounded-2xl border-2 p-4 transition select-none ${
              active
                ? "border-orangeDeep bg-orange/5 shadow-sm"
                : "border-charcoal/10 bg-white hover:border-orangeDeep/40"
            }`}
            aria-pressed={active}
          >
            {/* Checkmark */}
            <div
              className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                active
                  ? "bg-orangeDeep border-orangeDeep text-white"
                  : "border-charcoal/20 bg-white"
              }`}
            >
              {active && (
                <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                  <path d="M10 3 5 9.5 2 6.5l1.5-1.5 1.5 1.5L8.5 1.5 10 3z" />
                </svg>
              )}
            </div>

            <div
              className={`mb-3 p-2 rounded-xl w-fit transition ${
                active ? "bg-orangeDeep/10 text-orangeDeep" : "bg-cream text-inkSoft"
              }`}
            >
              {svc.icon}
            </div>
            <p className="font-semibold text-charcoal text-sm leading-snug mb-1">{svc.key}</p>
            <p className="text-xs text-inkSoft leading-relaxed mb-2">{svc.description}</p>
            <span
              className={`inline-block text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                active
                  ? "bg-orangeDeep/10 text-orangeDeep"
                  : "bg-cream text-inkSoft"
              }`}
            >
              {svc.price}
            </span>
          </button>
        );
      })}
    </div>
  );
}
