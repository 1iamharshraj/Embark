interface AdminSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminSection({ title, description, children, className }: AdminSectionProps) {
  return (
    <section className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="font-display font-bold text-xl text-charcoal">{title}</h2>}
          {description && <p className="text-sm text-inkSoft mt-1">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
