import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";

interface AdminHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ eyebrow, title, description, backHref, backLabel, actions }: AdminHeaderProps) {
  return (
    <div className="mb-8">
      {backHref && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 font-semibold text-orangeDeep hover:text-orangeDeep/80 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {backLabel || "Back"}
              </Link>
            </li>
            <li className="text-charcoal/30" aria-hidden="true">/</li>
            <li className="font-medium text-inkSoft truncate" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2">{title}</h1>
          {description && <p className="text-inkSoft mt-2 max-w-2xl">{description}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
