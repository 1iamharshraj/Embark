"use client";

interface PlaybookHeroProps {
  name: string;
  theme: string;
  oneLiner: string;
  eyebrow?: string;
}

function themeClass(theme: string) {
  switch (theme) {
    case "dark":
      return "pbt-dark";
    case "green":
      return "pbt-green";
    case "orange":
    default:
      return "pbt-orange";
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PlaybookHero({ name, theme, oneLiner, eyebrow = "Stream playbook" }: PlaybookHeroProps) {
  return (
    <header className={`pb-hero ${themeClass(theme)}`}>
      <span className="ghost" aria-hidden="true">
        {initials(name)}
      </span>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-[1]">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{name}</h1>
        <p className="pb-tagline">{oneLiner}</p>
      </div>
    </header>
  );
}
