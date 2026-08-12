"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import useReducedMotion from "@/hooks/use-reduced-motion";

interface TimelineEvent {
  id: string;
  phase: string;
  startsAt: Date;
  endsAt: Date | null;
}

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="relative pl-4">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-charcoal/10 rounded-full overflow-hidden">
        {!reduced && (
          <motion.div
            className="w-full bg-orange origin-top"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
            style={{ height: "100%" }}
          />
        )}
        {reduced && <div className="h-full bg-orange" />}
      </div>
      <div className="space-y-6">
        {events.map((t, i) => (
          <motion.div
            key={t.id}
            initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: 0.35, delay: reduced ? 0 : i * 0.1, ease: [0, 0, 0.2, 1] }}
            className="relative pl-6"
          >
            <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-orange border-2 border-white shadow-sm" />
            <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft">{t.phase}</div>
            <div className="text-sm text-charcoal font-medium">
              {t.startsAt.toLocaleDateString()} — {t.endsAt ? t.endsAt.toLocaleDateString() : "TBA"}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
