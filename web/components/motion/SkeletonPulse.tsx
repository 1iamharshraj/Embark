"use client";

import { motion } from "framer-motion";
import useReducedMotion from "@/hooks/use-reduced-motion";

interface SkeletonPulseProps {
  className?: string;
  count?: number;
}

export default function SkeletonPulse({ className = "h-4 w-full rounded bg-charcoal/10", count = 1 }: SkeletonPulseProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${className} ${reduced ? "bg-charcoal/10" : ""}`}
          style={reduced ? undefined : { overflow: "hidden" }}
        >
          {!reduced && (
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-charcoal/10 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
