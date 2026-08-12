import { Variants } from "framer-motion";

export const durations = {
  fast: 0.2,
  normal: 0.35,
  slow: 0.55,
} as const;

export const easings = {
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 24 },
} as const;

export const stagger = {
  fast: 0.05,
  normal: 0.08,
  slow: 0.12,
} as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger.normal, delayChildren: 0.05 },
  },
};

export const cardHover = {
  rest: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: {
    y: -4,
    boxShadow: "0 12px 28px rgba(22,22,22,0.08)",
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

export const pulseBadge = {
  initial: { scale: 0.8, opacity: 0.6 },
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.6, 1, 0.6],
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
  },
};

export const countUpSpring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 1.2,
};
