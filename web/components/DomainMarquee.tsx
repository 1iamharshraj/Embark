"use client";

const DOMAINS = [
  "Marketing",
  "Sales",
  "Statistics",
  "Finance",
  "Analytics",
  "Economics",
  "Supply Chain",
  "Market Research",
  "Consulting",
  "Strategy",
  "Product Management",
  "Project Management",
];

export default function DomainMarquee() {
  const items = [...DOMAINS, ...DOMAINS];

  return (
    <section className="mq-sec">
      <div className="mq" aria-label="MBA domains covered">
        <div className="mq-track">
          {items.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="mq-item"
              aria-hidden={i >= DOMAINS.length ? "true" : undefined}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
