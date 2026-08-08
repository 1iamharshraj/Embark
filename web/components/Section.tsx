import Container from "./Container";
import Eyebrow from "./Eyebrow";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
  dark?: boolean;
}

export default function Section({
  children,
  className = "",
  innerClassName = "",
  eyebrow,
  title,
  subtitle,
  centered = false,
  dark = false,
}: SectionProps) {
  return (
    <section className={`${dark ? "bg-navy text-cream" : "bg-cream"} py-16 sm:py-20 lg:py-24 ${className}`}>
      <Container>
        <div className={`${innerClassName} ${centered ? "text-center" : ""}`}>
          {eyebrow && (
            <div className={`${centered ? "justify-center" : ""}`}>
              <Eyebrow className={dark ? "text-orange" : ""}>{eyebrow}</Eyebrow>
            </div>
          )}
          {title && (
            <h2 className={`font-display font-bold text-3xl sm:text-4xl lg:text-4xl tracking-tight leading-tight mb-4 ${dark ? "text-white" : "text-charcoal"}`}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`max-w-2xl ${centered ? "mx-auto" : ""} text-base mb-10 ${dark ? "text-cream/70" : "text-inkSoft"}`}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </Container>
    </section>
  );
}
