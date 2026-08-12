"use client";

export default function EmptyState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <svg
        className="w-32 h-32 mb-4 text-inkSoft/40"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="30" width="80" height="70" rx="8" className="stroke-current" strokeWidth="3" fill="none">
          <animate attributeName="stroke-dasharray" values="0,300;300,0" dur="1.5s" repeatCount="1" fill="freeze" />
        </rect>
        <rect x="35" y="50" width="50" height="6" rx="3" className="fill-current opacity-40">
          <animate attributeName="width" values="0;50" dur="0.6s" begin="0.6s" fill="freeze" />
        </rect>
        <rect x="35" y="65" width="35" height="6" rx="3" className="fill-current opacity-40">
          <animate attributeName="width" values="0;35" dur="0.5s" begin="0.8s" fill="freeze" />
        </rect>
        <circle cx="95" cy="25" r="12" className="fill-orange/20 stroke-orange" strokeWidth="3">
          <animate attributeName="r" values="0;12" dur="0.4s" begin="0.4s" fill="freeze" />
        </circle>
        <path d="M89 25h12M95 19v12" className="stroke-orange" strokeWidth="3" strokeLinecap="round">
          <animate attributeName="stroke-dasharray" values="0,30;30,0" dur="0.4s" begin="0.6s" fill="freeze" />
        </path>
      </svg>
      {label && <p className="text-inkSoft">{label}</p>}
    </div>
  );
}
