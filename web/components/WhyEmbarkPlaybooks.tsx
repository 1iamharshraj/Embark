"use client";

const FEATURES = [
  {
    title: "Only What Matters",
    text: "Curated content with only the most important concepts, frameworks, and questions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Structured Preparation",
    text: "Topics are organized in a logical flow for better understanding and faster revision.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
        <rect x="8" y="2.5" width="8" height="4" rx="1" />
        <path d="M8 11h8M8 15h5" />
      </svg>
    ),
  },
  {
    title: "Interview-Focused Questions",
    text: "Practice the type of questions that are commonly asked in MBA interviews.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a8.4 8.4 0 0 1-.9-4A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" />
        <path d="M9.9 9.2a2.2 2.2 0 0 1 4.1.9c0 1.5-2 2-2 2" />
        <path d="M12 15.5h.01" />
      </svg>
    ),
  },
  {
    title: "Practical Frameworks",
    text: "Simple and effective frameworks to help you structure your answers with confidence.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.6" />
        <circle cx="17.5" cy="6" r="2.6" />
        <circle cx="17.5" cy="18" r="2.6" />
        <path d="m8.3 10.8 6.9-3.6M8.3 13.2l6.9 3.6" />
      </svg>
    ),
  },
  {
    title: "Quick Revision",
    text: "Concise summaries, key points, and cheat sheets for last-minute revision.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
      </svg>
    ),
  },
  {
    title: "Everything in One Place",
    text: "No more switching between resources. One playbook for complete preparation.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="m12.8 11 .9 1.9 2 .2-1.5 1.4.5 2-1.9-1.1-1.9 1.1.5-2L9.9 13.1l2-.2z" />
      </svg>
    ),
  },
];

export default function WhyEmbarkPlaybooks() {
  return (
    <section className="pbk wep">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="wep-head">
          <h2>Why Embark India Playbooks?</h2>
          <p>Built for interviews. Designed for quick revision. Focused on results.</p>
        </div>
        <div className="wep-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="wep-item">
              <div className="wep-ico" aria-hidden="true">
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
