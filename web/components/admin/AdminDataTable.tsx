import { AdminCard } from "./AdminCard";

interface AdminDataTableProps {
  title?: string;
  description?: string;
  count?: number;
  filterSlot?: React.ReactNode;
  pagination?: React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function AdminDataTable({
  title,
  description,
  count,
  filterSlot,
  pagination,
  empty,
  className,
  children,
}: AdminDataTableProps) {
  return (
    <AdminCard className={className}>
      <div className="p-5 sm:p-6 border-b border-charcoal/8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            {title && <h2 className="font-display font-bold text-xl text-charcoal">{title}</h2>}
            {description && <p className="text-sm text-inkSoft mt-1">{description}</p>}
            {typeof count === "number" && (
              <p className="text-xs font-medium text-inkSoft mt-2">
                {count} record{count === 1 ? "" : "s"}
              </p>
            )}
          </div>
          {filterSlot && <div className="flex flex-wrap items-center gap-2">{filterSlot}</div>}
        </div>
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
      {pagination && <div className="p-4 border-t border-charcoal/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">{pagination}</div>}
      {empty}
    </AdminCard>
  );
}
