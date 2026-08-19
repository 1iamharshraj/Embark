import Link from "next/link";

interface ExpertPlaceholderPageProps {
  title: string;
  description?: string;
  related?: { href: string; label: string }[];
}

export default function ExpertPlaceholderPage({
  title,
  description,
  related,
}: ExpertPlaceholderPageProps) {
  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-orangeSoft text-orangeDeep flex items-center justify-center mx-auto mb-4">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <h2 className="font-display font-bold text-xl text-charcoal mb-2">{title}</h2>
      <p className="text-inkSoft text-sm max-w-md mx-auto mb-6">
        {description || "This expert hub section is coming soon. You can connect the real data and actions here next."}
      </p>

      {related && related.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {related.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center justify-center rounded-full border-[1.5px] border-charcoal/25 text-charcoal font-semibold text-sm px-5 py-2.5 hover:border-charcoal transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
