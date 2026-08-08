import type { Competition } from "@prisma/client";

export type Round = {
  name: string;
  brief?: string;
  description?: string;
  type?: string;
  link?: string;
  opens?: string;
  closes?: string;
  deadline?: string;
};

export type Member = {
  name: string;
  email: string;
  college: string;
};

export type Contact = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type PrizeRow = [string, string];

export function parseRounds(rounds: unknown): Round[] {
  if (!Array.isArray(rounds)) return [];
  return rounds.map((r) => ({
    name: r?.name ?? "Round",
    brief: r?.brief ?? r?.description ?? "",
    description: r?.description ?? r?.brief ?? "",
    type: r?.type ?? "",
    link: r?.link ?? "",
    opens: r?.opens ?? r?.openAt ?? "",
    closes: r?.closes ?? r?.closeAt ?? r?.deadline ?? "",
    deadline: r?.deadline ?? r?.closes ?? r?.closeAt ?? "",
  }));
}

export function competitionStatus(
  comp: Pick<Competition, "regOpen" | "regClose" | "startAt" | "endAt" | "resultAt">
): "Live" | "Upcoming" | "Running" | "Closed" {
  const now = new Date();
  if (now < comp.regOpen) return "Upcoming";
  if (now >= comp.regOpen && now <= comp.regClose) return "Live";
  if (now > comp.regClose && now < comp.endAt) return "Running";
  return "Closed";
}

export function roundStatus(round: Round): "open" | "upcoming" | "closed" {
  const now = new Date();
  const opens = round.opens ? new Date(round.opens) : null;
  const closes = round.closes ? new Date(round.closes) : null;
  if (opens && now < opens) return "upcoming";
  if (closes && now > closes) return "closed";
  if (opens && closes && now >= opens && now <= closes) return "open";
  if (opens && now >= opens && !closes) return "open";
  return "upcoming";
}

export function roundIsOpen(round: Round): boolean {
  return roundStatus(round) === "open";
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "Live":
      return "bg-green-100 text-green-700";
    case "Running":
      return "bg-blue-100 text-blue-700";
    case "Upcoming":
      return "bg-orangeSoft text-orangeDeep";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function roundBadgeClass(status: string): string {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-700";
    case "closed":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-orangeSoft text-orangeDeep";
  }
}

export function formatDateRange(open: Date, close: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${open.toLocaleDateString("en-IN", opts)} – ${close.toLocaleDateString("en-IN", opts)}`;
}

export function parseMembers(members: unknown): Member[] {
  if (!Array.isArray(members)) return [];
  return members.map((m) => ({
    name: m?.name ?? "",
    email: m?.email ?? "",
    college: m?.college ?? "",
  }));
}

export function parsePrizes(prizes: unknown): PrizeRow[] {
  if (!Array.isArray(prizes)) return [];
  return prizes
    .filter((p) => Array.isArray(p) && p.length >= 2)
    .map((p) => [String(p[0]), String(p[1])]);
}

export function parseFaqs(faqs: unknown): Faq[] {
  if (!Array.isArray(faqs)) return [];
  return faqs
    .filter((f) => f && (f.question || f.answer))
    .map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" }));
}

export function parseContacts(contacts: unknown): Contact[] {
  if (!Array.isArray(contacts)) return [];
  return contacts
    .filter((c) => c && (c.name || c.email || c.phone))
    .map((c) => ({
      name: c.name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      role: c.role ?? "",
    }));
}

export function compIsOpenForRegistration(comp: Competition): boolean {
  const now = new Date();
  return !comp.draft && comp.fee === 0 && now >= comp.regOpen && now <= comp.regClose;
}

export function collegesMatch(allowed: string[], memberColleges: string[]): boolean {
  if (!allowed.length) return true;
  const normalizedAllowed = allowed.map((c) => c.toLowerCase().trim());
  return memberColleges.every((college) => {
    const normalized = college.toLowerCase().trim();
    return normalizedAllowed.some((allowed) => allowed === normalized || normalized.includes(allowed) || allowed.includes(normalized));
  });
}
