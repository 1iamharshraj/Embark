"use client";

export default function SuccessState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <svg className="w-28 h-28 mb-4" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="44" className="fill-green-100 stroke-green-500" strokeWidth="4">
          <animate attributeName="r" values="0;44" dur="0.4s" fill="freeze" />
          <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze" />
        </circle>
        <path
          d="M40 62 L55 77 L82 48"
          className="stroke-green-600"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate attributeName="stroke-dasharray" values="0,60;60,0" dur="0.5s" begin="0.3s" fill="freeze" />
        </path>
      </svg>
      {label && <p className="text-charcoal font-semibold">{label}</p>}
    </div>
  );
}
