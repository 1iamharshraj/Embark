"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import useReducedMotion from "@/hooks/use-reduced-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    stiffness: 100,
    damping: 20,
    duration,
  });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`);

  useEffect(() => {
    if (inView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [inView, hasAnimated, spring, value]);

  if (reduced) {
    return (
      <span ref={ref} className={className}>
        {prefix}{value.toLocaleString("en-IN")}{suffix}
      </span>
    );
  }

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
