import Image from "next/image";
import Link from "next/link";

interface MentorCardProps {
  slug: string;
  name: string;
  image: string;
  role: string;
  company: string;
  college: string;
  batch: string;
  expertise: string[];
  rating: number;
  sessions: number;
  tier: string;
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
  return (
    <div className="bg-cream rounded-3xl p-6 h-full flex flex-col gap-4 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
      <div className="flex items-center gap-4">
        <Image
          src={image}
          alt={name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-2xl object-cover shadow-[0_0_0_3px_#fff]"
          unoptimized
        />
        <div>
          <b className="block font-display font-bold text-base text-charcoal">{name}</b>
          <small className="block text-sm text-inkSoft">
            {role} · {company}
          </small>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy bg-navySoft rounded-full px-2.5 py-1 mt-1">
            {college} {batch}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {expertise.slice(0, 4).map((tag) => (
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
          <span className="text-orangeDeep font-bold">★ {rating.toFixed(1)}</span>
        </span>
        <span>
          <b className="text-charcoal">{sessions}</b> sessions
        </span>
        <span>{tier === "alumni" ? "Recent alumni" : "Industry pro"}</span>
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
