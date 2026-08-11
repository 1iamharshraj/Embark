"use client";

import Image from "next/image";

type LogoItem =
  | { img: string; alt: string }
  | { mono: [string, string] };

const logos: LogoItem[] = [
  { mono: ["IIM", "A"] },
  { img: "/assets/logos/hul.png", alt: "HUL" },
  { mono: ["IIM", "B"] },
  { img: "/assets/logos/mckinsey.png", alt: "McKinsey" },
  { img: "/assets/logos/isb.png", alt: "ISB" },
  { img: "/assets/logos/amazon.png", alt: "Amazon" },
  { mono: ["IIM", "C"] },
  { img: "/assets/logos/razorpay.png", alt: "Razorpay" },
  { img: "/assets/logos/xlri.png", alt: "XLRI" },
  { img: "/assets/logos/swiggy.png", alt: "Swiggy" },
];

function isImgLogo(l: LogoItem): l is { img: string; alt: string } {
  return "img" in l;
}

export default function LogoMarquee() {
  const duplicated = [...logos, ...logos];

  return (
    <section className="cred bg-white py-16 lg:py-[64px] overflow-hidden" aria-label="Where our speakers come from">
      <div className="max-w-[560px] mx-auto text-center mb-8 px-6">
        <h2 className="font-display font-bold text-[clamp(1.5rem,2.8vw,2rem)] text-charcoal mb-2">
          Studied at the best. Working at the best.
        </h2>
        <p className="text-[0.98rem] text-inkSoft">
          Our speakers carry two signatures — the campuses that trained them and the companies that trust them.
        </p>
      </div>
      <div
        className="marquee overflow-hidden py-2"
        style={{
          WebkitMaskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",
          maskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",
        }}
      >
        <div className="marquee-track flex gap-[18px] w-max animate-[logoslide_28s_linear_infinite]">
          {duplicated.map((l, i) => (
            <span key={i} className="logo-tile">
              {isImgLogo(l) ? (
                <Image
                  src={l.img}
                  alt={l.alt}
                  width={52}
                  height={52}
                  className="w-[52px] h-[52px] object-contain rounded-[10px]"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                  unoptimized
                />
              ) : (
                <span className="logo-mono">
                  <i>{l.mono[0]}</i>
                  <b>{l.mono[1]}</b>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
