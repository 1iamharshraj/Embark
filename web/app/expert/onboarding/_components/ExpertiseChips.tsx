"use client";

const EXPERTISE_OPTIONS = [
  "Marketing",
  "Finance",
  "Strategy",
  "Product",
  "Consulting",
  "Analytics",
  "Operations",
  "HR",
  "Sales",
  "Entrepreneurship",
  "Supply chain",
  "Data",
  "Design",
  "Technology",
  "Leadership",
  "General Management",
];

interface ExpertiseChipsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ExpertiseChips({ selected, onChange }: ExpertiseChipsProps) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((s) => s !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {EXPERTISE_OPTIONS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition select-none ${
              active
                ? "bg-orangeDeep text-white border-orangeDeep shadow-sm"
                : "bg-white text-charcoal border-charcoal/12 hover:border-orangeDeep/50 hover:text-orangeDeep"
            }`}
            aria-pressed={active}
          >
            {active && (
              <svg
                viewBox="0 0 12 12"
                fill="currentColor"
                className="w-3 h-3 shrink-0"
                aria-hidden="true"
              >
                <path d="M10 3 5 9.5 2 6.5l1.5-1.5 1.5 1.5L8.5 1.5 10 3z" />
              </svg>
            )}
            {tag}
          </button>
        );
      })}
    </div>
  );
}
