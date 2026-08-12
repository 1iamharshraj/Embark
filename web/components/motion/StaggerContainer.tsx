"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import useReducedMotion from "@/hooks/use-reduced-motion";

type AsProp = "div" | "tr" | "tbody" | "ul" | "li";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  as?: AsProp;
}

export default function StaggerContainer({
  children,
  className,
  staggerDelay,
  once = true,
  as = "div",
}: StaggerContainerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Component = as;
    return <Component className={className}>{children}</Component>;
  }

  const variants = staggerDelay
    ? {
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.05 },
        },
      }
    : staggerContainer;

  const MotionComponent = motion[as];
  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.1 }}
      variants={variants}
    >
      {children}
    </MotionComponent>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  as?: AsProp;
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Component = as;
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion[as];
  return (
    <MotionComponent
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: [0, 0, 0.2, 1] },
        },
      }}
    >
      {children}
    </MotionComponent>
  );
}
