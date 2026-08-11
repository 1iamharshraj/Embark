"use client";

import Image from "next/image";
import Link from "next/link";

const posters = [
  { src: "/assets/posters/finance.png", alt: "Embark India Finance Competition — coming soon" },
  { src: "/assets/posters/quiz.png", alt: "Embark India All India Quiz — coming soon" },
  { src: "/assets/posters/marketing.png", alt: "Embark India Marketing Maverick — coming soon" },
];

export default function PosterMarquee() {
  const duplicated = [...posters, ...posters];

  return (
    <section className="bg-cream py-14 overflow-hidden" aria-label="Upcoming competitions">
      <div className="relative">
        <div className="flex gap-6 w-max animate-[postslide_36s_linear_infinite] hover:[animation-play-state:paused]">
          {duplicated.map((p, i) => (
            <Link
              key={`${p.src}-${i}`}
              href="/competitions"
              className="relative block rounded-2xl overflow-hidden shadow-[0_10px_26px_rgba(22,22,22,0.14)] hover:shadow-[0_16px_38px_rgba(22,22,22,0.22)] transition flex-none w-[min(52vw,640px)] group"
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={640}
                height={360}
                className="w-full h-auto object-cover"
                priority={i < 3}
              />
              <span
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                }}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
