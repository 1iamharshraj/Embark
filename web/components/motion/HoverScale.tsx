"use client";

import { motion } from "framer-motion";
import useReducedMotion from "@/hooks/use-reduced-motion";

interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export default function HoverScale({ children, className, scale = 1.02 }: HoverScaleProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} whileHover={{ scale }} transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
