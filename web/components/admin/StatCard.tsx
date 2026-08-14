import { AdminCard } from "./AdminCard";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <AdminCard className={`p-5 hover:shadow-[0_8px_24px_rgba(22,22,22,0.08)] transition-shadow ${className || ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-inkSoft">{label}</p>
          <p className="font-display font-bold text-3xl text-charcoal mt-1">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trendUp ? "text-green-700" : "text-red-700"}`}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-orangeSoft text-orangeDeep flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
    </AdminCard>
  );
}
