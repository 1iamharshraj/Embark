import Link from "next/link";
import React from "react";

type ButtonVariant = "primary" | "ghost" | "green" | "light";
type ButtonSize = "sm" | "default";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97]";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-orangeDeep text-white shadow-[0_6px_18px_rgba(29,78,216,0.28)] hover:bg-[#1740A8]",
  ghost:
    "bg-transparent text-charcoal border-[1.5px] border-charcoal/25 hover:border-charcoal",
  green: "bg-green text-white hover:bg-navyDeep",
  light: "bg-cream text-charcoal hover:bg-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm min-h-[44px]",
  default: "px-7 py-3.5 text-base min-h-[48px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "default",
  href,
  type = "button",
  onClick,
  className = "",
}: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
