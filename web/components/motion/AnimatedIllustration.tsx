"use client";

import dynamic from "next/dynamic";
import useReducedMotion from "@/hooks/use-reduced-motion";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface AnimatedIllustrationProps {
  animationData?: object;
  staticFallback: React.ReactNode;
  className?: string;
}

export default function AnimatedIllustration({
  animationData,
  staticFallback,
  className,
}: AnimatedIllustrationProps) {
  const reduced = useReducedMotion();

  if (reduced || !animationData) {
    return <div className={className}>{staticFallback}</div>;
  }

  return (
    <div className={className}>
      <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
