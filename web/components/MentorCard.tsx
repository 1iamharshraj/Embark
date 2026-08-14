import Image from "next/image";
import Link from "next/link";

interface MentorCardProps {
  slug: string;
  name: string;
  image?: string | null;
  role?: string | null;
  company?: string | null;
  college?: string | null;
  batch?: string | null;
  expertise?: string[] | null;
  rating?: number | null;
  sessions?: number | null;
  tier?: string | null;
}

export default function MentorCard({
  slug,
  name,
  image,
  role,
  company,
  college,
  batch,
  expertise,
  rating,
  sessions,
  tier,
}: MentorCardProps) {
  const safeImage = image ?? "";
  const safeRole = role ?? "";
  const safeCompany = company ?? "";
  const safeCollege = college ?? "";
  const safeBatch = batch ?? "";
  const safeExpertise = expertise ?? [];
  const safeRating = rating ?? 0;
  const safeSessions = sessions ?? 0;
  const safeTier = tier ?? "industry";
  return (
    <div className="bg-cream rounded-3xl p-6 h-full flex flex-col gap-4 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
      <div className="flex items-center gap-4">
        <Image
          src={safeImage}
          alt={name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-2xl object-cover shadow-[0_0_0_3px_#fff]"
          unoptimized
        />
        <div>
          <b className="block font-display font-bold text-base text-charcoal">{name}</b>
          <small className="block text-sm text-inkSoft">
            {safeRole} · {safeCompany}
          </small>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy bg-navySoft rounded-full px-2.5 py-1 mt-1">
            {safeCollege} {safeBatch}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {safeExpertise.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium bg-white rounded-full px-3 py-1 text-inkSoft"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm text-inkSoft mt-auto">
        <span>
          <span className="text-orangeDeep font-bold">★ {safeRating.toFixed(1)}</span>
        </span>
        <span>
          <b className="text-charcoal">{safeSessions}</b> sessions
        </span>
        <span>{safeTier === "alumni" ? "Recent alumni" : "Industry pro"}</span>
      </div>
      <Link
        href={`/mentor/${slug}`}
        className="inline-flex items-center justify-center rounded-full border-[1.5px] border-charcoal/25 text-charcoal font-semibold text-sm px-5 py-2.5 hover:border-charcoal transition text-center"
      >
        View profile
      </Link>
    </div>
  );
}
