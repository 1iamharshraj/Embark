import Link from "next/link";
import type { ReactNode } from "react";

interface PlaybookCardProps {
  slug: string;
  title: string;
  tag: string;
  meta: string;
  rating: number;
  price: number;
  intro: string;
  coverIndex?: number;
  href?: string;
  onBuy?: () => void;
  hasAccess?: boolean;
  actionLabel?: string;
  buyButton?: ReactNode;
}

const covers = [
  "linear-gradient(150deg,#2E6BFF,#1D4ED8)",
  "linear-gradient(150deg,#0B1F3A,#16345C)",
  "linear-gradient(150deg,#1D4ED8,#1740A8)",
  "linear-gradient(150deg,#5B8CFF,#2E6BFF)",
  "linear-gradient(150deg,#16345C,#0B1F3A)",
  "linear-gradient(150deg,#2E6BFF,#5B8CFF)",
];

export default function PlaybookCard({
  slug,
  title,
  tag,
  meta,
  rating,
  price,
  intro,
  coverIndex = 0,
  href,
  onBuy,
  hasAccess,
  actionLabel,
  buyButton,
}: PlaybookCardProps) {
  const actionClasses =
    "inline-flex items-center justify-center rounded-xl bg-orangeDeep text-white font-semibold text-sm px-4 py-2.5 hover:bg-orange transition";

  const linkHref = href || (hasAccess ? `/playbook/${slug}` : undefined);
  const label = actionLabel || (hasAccess ? "Read playbook" : "View playbook");

  return (
    <article className="flex flex-col bg-white border border-charcoal/9 rounded-2xl overflow-hidden shadow-[0_8px_22px_rgba(22,22,22,0.05)] hover:shadow-[0_20px_44px_rgba(22,22,22,0.12)] hover:-translate-y-1 transition">
      <div
        className="h-32 p-5 flex flex-col justify-between text-white relative"
        style={{ background: covers[coverIndex % covers.length] }}
      >
        <span className="self-start text-xs font-bold uppercase tracking-wider bg-white/20 rounded-full px-3 py-1">
          {tag}
        </span>
        <span className="font-display font-extrabold text-lg leading-tight">{title}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-base text-charcoal mb-1">{title} Playbook</h3>
        <div className="flex items-center gap-3 text-xs text-inkSoft mb-3">
          <span className="text-orange font-bold">★ {rating.toFixed(1)}</span>
          <span>{meta}</span>
        </div>
        <p className="text-sm text-inkSoft leading-relaxed line-clamp-3 mb-4 flex-1">{intro}</p>
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-charcoal/8">
          <span className="font-display font-bold text-xl text-charcoal">₹{price}</span>
          {buyButton ? (
            buyButton
          ) : linkHref ? (
            <Link href={linkHref} className={actionClasses}>
              {label}
            </Link>
          ) : onBuy ? (
            <button type="button" onClick={onBuy} className={actionClasses}>
              Buy now
            </button>
          ) : (
            <span className="text-sm text-inkSoft">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}
