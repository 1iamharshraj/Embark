import Image from "next/image";
import Link from "next/link";

const bannerGradients: Record<string, string> = {
  orange: "linear-gradient(180deg,#5B8CFF,#1D4ED8)",
  green: "linear-gradient(180deg,#16345C,#08172B)",
  dark: "linear-gradient(180deg,#2A2A2A,#101010)",
  charcoal: "linear-gradient(180deg,#101010,#2E6BFF)",
};

function formatDate(iso: string | Date) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function LiveCompetitions({
  competitions,
}: {
  competitions: {
    id: string;
    title: string;
    category: string;
    banner: string;
    fee: number;
    regClose: Date;
    startAt: Date;
    endAt: Date;
    banners?: string[];
  }[];
}) {
  const now = new Date();
  const live = competitions.filter((c) => {
    const start = new Date(c.startAt);
    const end = new Date(c.endAt);
    return start <= now && now <= end;
  });

  if (!live.length) return null;

  return (
    <section className="bg-white py-10 lg:py-12" aria-label="Live competitions">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <span className="inline-flex items-center gap-2.5 font-display font-bold text-base mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-[lcpulse_1.6s_ease-in-out_infinite]" aria-hidden="true" />
          Live right now
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {live.map((c) => (
            <Link
              key={c.id}
              href={`/competition/${c.id}`}
              className="group flex items-center gap-3.5 text-decoration-none text-inherit bg-cream border border-charcoal/8 rounded-2xl p-4 hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(11,31,58,0.12)] transition"
            >
              {c.banners && c.banners.length ? (
                <Image
                  src={c.banners[0]}
                  alt=""
                  width={72}
                  height={48}
                  className="flex-none w-[72px] h-12 object-cover rounded-lg"
                  unoptimized
                />
              ) : (
                <span
                  className="flex-none w-1.5 self-stretch rounded-full"
                  style={{ background: bannerGradients[c.banner] || bannerGradients.orange }}
                  aria-hidden="true"
                />
              )}
              <span className="flex-1 min-w-0">
                <b className="block text-sm font-bold text-charcoal truncate">{c.title}</b>
                <small className="block text-xs text-inkSoft">
                  {c.category} · {c.fee ? `₹${c.fee}` : "Free"} · reg closes {formatDate(c.regClose)}
                </small>
              </span>
              <span className="flex-none text-sm font-semibold text-orangeDeep whitespace-nowrap group-hover:gap-2 inline-flex items-center gap-1 transition">
                Enter <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
