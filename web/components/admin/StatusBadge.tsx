import { cn } from "@/lib/cn";

const variants: Record<string, string> = {
  default: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  pending: "bg-orangeSoft text-orangeDeep",
  paid: "bg-green-100 text-green-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  registered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  live: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider",
        variants[key] || variants.default,
        className
      )}
    >
      {status}
    </span>
  );
}
