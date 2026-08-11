"use client";

import Image from "next/image";

const partners = [
  { name: "Sun Pharma", logo: "/assets/logos/sunpharma.png" },
  { name: "IDFC First Bank", logo: "/assets/logos/idfcfirst.png" },
  { name: "Maruti Suzuki", logo: "/assets/logos/marutisuzuki.png" },
  { name: "Tata Group", logo: "/assets/logos/tata.png" },
  { name: "Coca-Cola", logo: "/assets/logos/cocacola.png" },
  { name: "UltraTech", logo: "/assets/logos/ultratech.png" },
  { name: "Cipla", logo: "/assets/logos/cipla.png" },
  { name: "Capgemini", logo: "/assets/logos/capgemini.png" },
  { name: "ITC", logo: "/assets/logos/itc.png" },
  { name: "Hindustan Unilever", logo: "/assets/logos/hul.png" },
  { name: "McKinsey", logo: "/assets/logos/mckinsey.png" },
  { name: "Amazon", logo: "/assets/logos/amazon.png" },
  { name: "Razorpay", logo: "/assets/logos/razorpay.png" },
  { name: "Swiggy", logo: "/assets/logos/swiggy.png" },
];

export default function PartnersMarquee() {
  const duplicated = [...partners, ...partners];

  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24 overflow-hidden" aria-label="Companies associated with us">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-center text-charcoal mb-10">
          Our mentors have <em className="text-orange not-italic">built their careers</em> at
        </h2>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-8 w-max animate-[partnerslide_40s_linear_infinite] hover:[animation-play-state:paused] items-center">
          {duplicated.map((p, i) => (
            <span
              key={`${p.name}-${i}`}
              className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-[0_4px_14px_rgba(11,31,58,0.06)] flex-none"
            >
              <Image
                src={p.logo}
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <b className="text-sm font-semibold text-charcoal whitespace-nowrap">{p.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
