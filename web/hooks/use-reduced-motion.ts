"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

export default function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
