"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
}

export default function FAQ({ items, className = "" }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`border border-charcoal/10 rounded-2xl bg-white transition-all ${
              isOpen ? "border-orange/40 shadow-[0_12px_30px_rgba(11,31,58,0.09)]" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
            >
              <span className="font-display font-bold text-base text-charcoal leading-snug">
                {item.question}
              </span>
              <span
                className={`flex-none w-7 h-7 rounded-full bg-orangeSoft text-orangeDeep flex items-center justify-center text-lg font-bold transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-inkSoft leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
