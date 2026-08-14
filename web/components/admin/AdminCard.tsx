import { cn } from "@/lib/cn";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCard({ children, className }: AdminCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]",
        className
      )}
    >
      {children}
    </div>
  );
}
