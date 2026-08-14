interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}

interface StatRowProps {
  stats: Stat[];
}

export default function StatRow({ stats }: StatRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06)] p-5 flex flex-col gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center text-orangeDeep">
            {stat.icon}
          </div>
          <div>
            <div className="font-display font-bold text-2xl text-charcoal leading-none">
              {stat.value}
            </div>
            <div className="text-xs text-inkSoft mt-1 uppercase tracking-wide font-semibold">
              {stat.label}
            </div>
            {stat.sub && (
              <div className="text-[11px] text-inkSoft/70 mt-0.5">{stat.sub}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
