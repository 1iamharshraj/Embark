"use client";

interface StepProgressProps {
  current: number;
  steps: string[];
}

export default function StepProgress({ current, steps }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-1">
        {steps.map((label, idx) => {
          const i = idx + 1;
          const active = i === current;
          const completed = i < current;
          return (
            <div key={label} className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition ${
                  active
                    ? "bg-orangeDeep text-white shadow-md"
                    : completed
                    ? "bg-green text-white"
                    : "bg-white text-inkSoft border border-charcoal/10"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {completed ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  i
                )}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-center leading-tight hidden sm:block ${
                  active ? "text-orangeDeep" : completed ? "text-green" : "text-inkSoft"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1.5 bg-charcoal/8 rounded-full mt-3 mx-1 sm:mx-4 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-orangeDeep rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(0, ((current - 1) / (steps.length - 1)) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
