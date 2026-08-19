import Link from "next/link";
import type { Hackathon, HackathonTimeline } from "@prisma/client";
import { displayStatus, statusBadgeClass, hackathonStatus } from "@/lib/hackathon";

interface HackathonCardProps {
  hackathon: Hackathon & { timelines: HackathonTimeline[]; _count: { registrations: number } };
}

const bannerGradients: Record<string, string> = {
  orange: "linear-gradient(150deg,#5B8CFF,#2E6BFF)",
  green: "linear-gradient(180deg,#16345C,#08172B)",
  dark: "linear-gradient(180deg,#2A2A2A,#101010)",
  charcoal: "linear-gradient(180deg,#101010,#2E6BFF)",
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HackathonCard({ hackathon }: HackathonCardProps) {
  const status = hackathonStatus(hackathon);
  const resources = (hackathon.resources as { prizes?: [string, string][] } | undefined) ?? {};
  const eligibility = (hackathon.eligibility as { userTypes?: string[]; criteria?: string[] } | undefined) ?? {};
  const registrationTimeline = hackathon.timelines.find((t) => t.phase === "REGISTRATION");
  const submissionTimeline = hackathon.timelines.find((t) => t.phase === "SUBMISSION");

  const topPrize = resources.prizes?.[0];

  return (
    <Link
      href={`/hackathon/${hackathon.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden shadow-[0_10px_26px_rgba(22,22,22,0.14)] hover:shadow-[0_16px_38px_rgba(22,22,22,0.22)] transition bg-white hover:-translate-y-1 h-full"
    >
      <div
        className="h-44 flex items-end p-5 transition-transform duration-500 group-hover:scale-[1.02]"
        style={{ background: bannerGradients[hackathon.banner || "orange"] || bannerGradients.orange }}
      >
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/20 text-white rounded-full px-3 py-1 mb-2">
            {hackathon.category || "General"}
          </span>
          <h3 className="font-display font-bold text-xl text-white leading-tight">{hackathon.title}</h3>
          <p className="text-white/80 text-sm mt-1">{hackathon.organizer || "Embark India"}</p>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${statusBadgeClass(status)}`}
          >
            {displayStatus(hackathon)}
          </span>
          {eligibility.userTypes && eligibility.userTypes.length > 0 && (
            <span className="text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-cream text-charcoal border border-charcoal/8">
              {eligibility.userTypes.join(", ")}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-inkSoft mb-4">
          <div className="flex justify-between">
            <span>Registration deadline</span>
            <span className="font-medium text-charcoal">{formatDate(registrationTimeline?.endsAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Submission deadline</span>
            <span className="font-medium text-charcoal">{formatDate(submissionTimeline?.endsAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Participants</span>
            <span className="font-medium text-charcoal">{hackathon._count.registrations}</span>
          </div>
          {topPrize && (
            <div className="flex justify-between">
              <span>Prize</span>
              <span className="font-medium text-charcoal truncate max-w-[50%]">{topPrize[0]}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-charcoal/8 flex items-center justify-between">
          <span className="text-sm font-semibold text-charcoal">
            {hackathon.fee > 0 ? `₹${hackathon.fee}` : "Free"}
          </span>
          <span className="text-sm font-semibold text-orangeDeep group-hover:underline">View details →</span>
        </div>
      </div>
    </Link>
  );
}
