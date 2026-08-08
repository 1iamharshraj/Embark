"use client";

import Link from "next/link";

const posterGradients = [
  "linear-gradient(150deg,#5B8CFF,#2E6BFF)",
  "linear-gradient(150deg,#0B1F3A,#16345C)",
  "linear-gradient(150deg,#1D4ED8,#1740A8)",
];

export default function PosterStrip({
  competitions,
}: {
  competitions: { id: string; title: string; category: string; banner: string }[];
}) {
  if (!competitions.length) return null;
  const duplicated = [...competitions, ...competitions];
  return (
    <section className="bg-[#F1F1F1] py-14 overflow-hidden">
      <div className="relative">
        <div className="flex gap-7 w-max animate-[postslide_36s_linear_infinite] hover:[animation-play-state:paused]">
          {duplicated.map((c, i) => (
            <Link
              key={`${c.id}-${i}`}
              href={`/competition/${c.id}`}
              className="relative block rounded-2xl overflow-hidden shadow-[0_10px_26px_rgba(22,22,22,0.14)] hover:shadow-[0_16px_38px_rgba(22,22,22,0.22)] transition flex-none w-[min(52vw,640px)]"
            >
              <div
                className="h-56 sm:h-72 w-full flex items-end p-6"
                style={{ background: posterGradients[i % posterGradients.length] }}
              >
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/20 text-white rounded-full px-3 py-1 mb-2">
                    {c.category}
                  </span>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
                    {c.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes postslide {
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
