import type { Hackathon, HackathonTimeline } from "@prisma/client";

export type HackathonWithTimelines = Hackathon & { timelines: HackathonTimeline[] };

export function hackathonStatus(hackathon: HackathonWithTimelines): string {
  const now = new Date();

  for (const phase of ["REGISTRATION", "SUBMISSION", "EVALUATION", "RESULT"] as const) {
    const timeline = hackathon.timelines.find((t) => t.phase === phase);
    if (!timeline) continue;
    const start = timeline.startsAt;
    const end = timeline.endsAt;
    if (now >= start && (!end || now <= end)) return phase;
  }

  const first = hackathon.timelines[0];
  if (first && now < first.startsAt) return "UPCOMING";
  return "CLOSED";
}

export function registrationOpen(hackathon: HackathonWithTimelines): boolean {
  return hackathonStatus(hackathon) === "REGISTRATION";
}

export function submissionOpen(hackathon: HackathonWithTimelines): boolean {
  return hackathonStatus(hackathon) === "SUBMISSION";
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "REGISTRATION":
      return "bg-green-100 text-green-700";
    case "SUBMISSION":
      return "bg-blue-100 text-blue-700";
    case "EVALUATION":
      return "bg-orangeSoft text-orangeDeep";
    case "RESULT":
      return "bg-purple-100 text-purple-700";
    case "UPCOMING":
      return "bg-orangeSoft text-orangeDeep";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function submissionDeadline(hackathon: HackathonWithTimelines): Date | null {
  const timeline = hackathon.timelines.find((t) => t.phase === "SUBMISSION");
  return timeline?.endsAt || null;
}
export function displayStatus(hackathon: HackathonWithTimelines): string {
  const status = hackathonStatus(hackathon);
  if (status === "UPCOMING") return "Upcoming";
  if (status === "REGISTRATION") return "Registration open";
  if (status === "SUBMISSION") return "Submission open";
  if (status === "EVALUATION") return "Under evaluation";
  if (status === "RESULT") return "Results published";
  return "Closed";
}
