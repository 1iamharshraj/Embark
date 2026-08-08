import Link from "next/link";

interface CompetitionCardProps {
  id: string;
  title: string;
  category: string;
  banner: string;
  fee: number;
  status: string;
  poster?: string;
  registrationCount?: number;
}

const bannerGradients: Record<string, string> = {
  orange: "linear-gradient(150deg,#5B8CFF,#2E6BFF)",
  green: "linear-gradient(180deg,#16345C,#08172B)",
  dark: "linear-gradient(180deg,#2A2A2A,#101010)",
  charcoal: "linear-gradient(180deg,#101010,#2E6BFF)",
};

export default function CompetitionCard({
  id,
  title,
  category,
  banner,
  fee,
  status,
  registrationCount,
}: CompetitionCardProps) {
  return (
    <Link
      href={`/competition/${id}`}
      className="group relative block rounded-2xl overflow-hidden shadow-[0_10px_26px_rgba(22,22,22,0.14)] hover:shadow-[0_16px_38px_rgba(22,22,22,0.22)] transition bg-white"
    >
      <div
        className="h-48 flex items-end p-5"
        style={{ background: bannerGradients[banner] || bannerGradients.orange }}
      >
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/20 text-white rounded-full px-3 py-1 mb-2">
            {category}
          </span>
          <h3 className="font-display font-bold text-xl text-white leading-tight">{title}</h3>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm text-inkSoft">
          <span>{fee > 0 ? `Fee: ₹${fee}` : "Free"}</span>
          {typeof registrationCount === "number" && (
            <span className="ml-3 text-charcoal font-medium">{registrationCount} registered</span>
          )}
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${
            status === "Live"
              ? "bg-green-100 text-green-700"
              : status === "Upcoming"
              ? "bg-orangeSoft text-orangeDeep"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}
