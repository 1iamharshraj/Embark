interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export default function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-green mb-4 ${className}`}
    >
      <span className="w-8 border-t-2 border-dashed border-green" aria-hidden="true" />
      {children}
    </span>
  );
}
