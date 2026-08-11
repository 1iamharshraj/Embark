"use client";

const CARDS = [
  {
    num: "01",
    title: "Too Many Resources",
    text: "Notes, videos, textbooks, PDFs, and websites leave preparation scattered across multiple sources.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="5" height="16" rx="1" />
        <rect x="9" y="4" width="5" height="16" rx="1" />
        <path d="m15.6 5.2 4 1-3.4 13.8-4-1z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Unclear Priorities",
    text: "Students often struggle to identify what matters most and what interviewers are likely to assess.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M15 5H5.5L3 7.5 5.5 10H15z" />
        <path d="M9 14h9.5l2.5 2.5-2.5 2.5H9z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Limited Revision Time",
    text: "Interviews arrive quickly, leaving little time to revise an extensive MBA syllabus.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 9V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6" />
        <path d="M8 2v4M16 2v4M3 10h18" />
        <circle cx="17.5" cy="16.5" r="4.2" />
        <path d="M17.5 14.8v1.7l1.1.9" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Difficulty Structuring Answers",
    text: "Understanding a concept is easier than explaining it clearly, practically, and confidently in an interview.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a8.4 8.4 0 0 1-.9-4A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </svg>
    ),
  },
];

export default function WhyStudentsNeed() {
  return (
    <section className="pbk pbk-alt">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="wsn">
          <div>
            <div className="wsn-head">
              <h2>
                Why Students Need
                <br />
                <span>These Playbooks</span>
              </h2>
              <div className="wsn-rule" aria-hidden="true" />
              <p>MBA interview preparation can feel overwhelming. We make revision simpler and more focused.</p>
            </div>
            <div className="wsn-cards">
              {CARDS.map((card) => (
                <div key={card.num} className="wsn-card">
                  <div className="wsn-ico" aria-hidden="true">
                    {card.icon}
                  </div>
                  <span className="wsn-num">{card.num}</span>
                  <h3>{card.title}</h3>
                  <p dangerouslySetInnerHTML={{ __html: card.text }} />
                </div>
              ))}
            </div>
          </div>
          <aside className="wsn-panel">
            <svg className="wsn-dots" width="72" height="72" viewBox="0 0 72 72" fill="currentColor" aria-hidden="true">
              <g>
                <circle cx="6" cy="6" r="2.4" />
                <circle cx="24" cy="6" r="2.4" />
                <circle cx="42" cy="6" r="2.4" />
                <circle cx="60" cy="6" r="2.4" />
                <circle cx="6" cy="24" r="2.4" />
                <circle cx="24" cy="24" r="2.4" />
                <circle cx="42" cy="24" r="2.4" />
                <circle cx="60" cy="24" r="2.4" />
                <circle cx="6" cy="42" r="2.4" />
                <circle cx="24" cy="42" r="2.4" />
                <circle cx="42" cy="42" r="2.4" />
                <circle cx="60" cy="42" r="2.4" />
              </g>
            </svg>
            <div className="wsn-panel-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 7C10.4 5.6 8 5 4 5v13c4 0 6.4.6 8 2 1.6-1.4 4-2 8-2V5c-4 0-6.4.6-8 2Z" />
                <path d="M12 7v13" />
                <path d="M19.5 2.5l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4L17.6 4.4l1.4-.5z" />
              </svg>
            </div>
            <p className="wsn-panel-text">
              <b>Embark India playbooks</b> bring essential concepts, questions, frameworks, and examples into one
              focused interview-preparation resource.
            </p>
            <svg className="wsn-plane" viewBox="0 0 130 92" fill="none" aria-hidden="true">
              <path d="M8 82 C 34 62, 62 52, 98 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 7" opacity="0.55" />
              <path d="M124 8 98 86 79 55 124 8Z" fill="currentColor" />
              <path d="M124 8 52 60 79 55 124 8Z" fill="currentColor" opacity="0.6" />
            </svg>
          </aside>
        </div>
      </div>
    </section>
  );
}
