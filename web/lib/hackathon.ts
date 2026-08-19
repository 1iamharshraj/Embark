import type { Hackathon, HackathonTimeline } from "@prisma/client";

export type HackathonWithTimelines = Hackathon & { timelines: HackathonTimeline[] };

const LIFECYCLE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "HACKATHON_ACTIVE",
  "SUBMISSION_OPEN",
  "SUBMISSION_CLOSED",
  "EVALUATION",
  "RESULTS_FINALIZED",
  "RESULTS_PUBLISHED",
  "CERTIFICATES_ISSUED",
  "CLOSED",
] as const;

export type HackathonLifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];

export function isLifecycleStatus(status: string | null | undefined): status is HackathonLifecycleStatus {
  return LIFECYCLE_STATUSES.includes(status as HackathonLifecycleStatus);
}

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

function statusAllowsRegistration(status: string | null | undefined): boolean {
  if (!status || status === "DRAFT") return true; // legacy / tests
  return ["PUBLISHED", "REGISTRATION_OPEN"].includes(status);
}

function statusAllowsSubmission(status: string | null | undefined): boolean {
  if (!status || status === "DRAFT") return true; // legacy / tests
  return ["HACKATHON_ACTIVE", "SUBMISSION_OPEN"].includes(status);
}

export function registrationOpen(hackathon: HackathonWithTimelines): boolean {
  return statusAllowsRegistration(hackathon.status) && hackathonStatus(hackathon) === "REGISTRATION";
}

export function submissionOpen(hackathon: HackathonWithTimelines): boolean {
  return statusAllowsSubmission(hackathon.status) && hackathonStatus(hackathon) === "SUBMISSION";
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "REGISTRATION":
    case "REGISTRATION_OPEN":
      return "bg-green-100 text-green-700";
    case "SUBMISSION":
    case "SUBMISSION_OPEN":
      return "bg-blue-100 text-blue-700";
    case "EVALUATION":
      return "bg-orangeSoft text-orangeDeep";
    case "RESULT":
    case "RESULTS_FINALIZED":
    case "RESULTS_PUBLISHED":
      return "bg-purple-100 text-purple-700";
    case "UPCOMING":
    case "PUBLISHED":
      return "bg-orangeSoft text-orangeDeep";
    case "CERTIFICATES_ISSUED":
      return "bg-green-100 text-green-700";
    case "CLOSED":
    case "REGISTRATION_CLOSED":
    case "SUBMISSION_CLOSED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function submissionDeadline(hackathon: HackathonWithTimelines): Date | null {
  const timeline = hackathon.timelines.find((t) => t.phase === "SUBMISSION");
  return timeline?.endsAt || null;
}

const LIFECYCLE_LABELS: Record<HackathonLifecycleStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  REGISTRATION_OPEN: "Registration open",
  REGISTRATION_CLOSED: "Registration closed",
  HACKATHON_ACTIVE: "Hackathon active",
  SUBMISSION_OPEN: "Submission open",
  SUBMISSION_CLOSED: "Submission closed",
  EVALUATION: "Under evaluation",
  RESULTS_FINALIZED: "Results finalized",
  RESULTS_PUBLISHED: "Results published",
  CERTIFICATES_ISSUED: "Certificates issued",
  CLOSED: "Closed",
};

export function displayStatus(hackathon: HackathonWithTimelines): string {
  if (hackathon.status && isLifecycleStatus(hackathon.status) && hackathon.status !== "DRAFT") {
    return LIFECYCLE_LABELS[hackathon.status];
  }
  const status = hackathonStatus(hackathon);
  if (status === "UPCOMING") return "Upcoming";
  if (status === "REGISTRATION") return "Registration open";
  if (status === "SUBMISSION") return "Submission open";
  if (status === "EVALUATION") return "Under evaluation";
  if (status === "RESULT") return "Results published";
  return "Closed";
}
