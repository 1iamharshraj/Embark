import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import EmptyState from "@/components/illustrations/EmptyState";
import {
  hackathonStatus,
  registrationOpen,
  submissionOpen,
} from "@/lib/hackathon";
import HackathonCard from "./_components/HackathonCard";
import type { Hackathon, HackathonTimeline } from "@prisma/client";

export const metadata: Metadata = {
  title: "Hackathons & Case Competitions — Embark India",
  description:
    "Live and upcoming MBA case competitions and hackathons. Filter by category, status, mode, deadline and prizes. Register solo or as a team.",
};

export const dynamic = "force-dynamic";

type HackathonWithTimelines = Hackathon & {
  timelines: HackathonTimeline[];
  _count: { registrations: number };
};

type Bucket = "registration" | "ongoing" | "submission" | "evaluation" | "completed" | "upcoming";

function isCompleted(hackathon: HackathonWithTimelines): boolean {
  const terminalStatuses = ["RESULTS_PUBLISHED", "CERTIFICATES_ISSUED", "CLOSED"];
  if (hackathon.status && terminalStatuses.includes(hackathon.status)) return true;

  const now = new Date();
  if (hackathon.timelines.length === 0) return false;
  const last = [...hackathon.timelines].sort((a, b) => {
    const aEnd = a.endsAt?.getTime() ?? a.startsAt.getTime();
    const bEnd = b.endsAt?.getTime() ?? b.startsAt.getTime();
    return aEnd - bEnd;
  })[hackathon.timelines.length - 1];
  const lastEnd = last.endsAt?.getTime() ?? last.startsAt.getTime();
  return now.getTime() > lastEnd;
}

function isOngoing(hackathon: HackathonWithTimelines): boolean {
  const now = new Date();
  const hackathonPhase = hackathon.timelines.find((t) => t.phase === "HACKATHON");
  if (!hackathonPhase) return false;
  const start = hackathonPhase.startsAt.getTime();
  const end = hackathonPhase.endsAt?.getTime();
  return now.getTime() >= start && (!end || now.getTime() <= end);
}

function discoveryBucket(hackathon: HackathonWithTimelines): Bucket {
  if (isCompleted(hackathon)) return "completed";
  const status = hackathonStatus(hackathon);
  if (status === "EVALUATION") return "evaluation";
  if (submissionOpen(hackathon)) return "submission";
  if (isOngoing(hackathon)) return "ongoing";
  if (registrationOpen(hackathon)) return "registration";
  return "upcoming";
}

function nextDeadline(hackathon: HackathonWithTimelines): Date | null {
  const now = new Date().getTime();
  const candidates: Date[] = [];

  const registration = hackathon.timelines.find((t) => t.phase === "REGISTRATION")?.endsAt;
  if (registration && registration.getTime() >= now) candidates.push(registration);

  const submission = hackathon.timelines.find((t) => t.phase === "SUBMISSION")?.endsAt;
  if (submission && submission.getTime() >= now) candidates.push(submission);

  hackathon.timelines.forEach((t) => {
    if (t.endsAt && t.endsAt.getTime() >= now) candidates.push(t.endsAt);
  });

  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => a.getTime() - b.getTime())[0];
}

function hasPrize(hackathon: HackathonWithTimelines): boolean {
  const resources = hackathon.resources as { prizes?: unknown[] } | undefined;
  return Array.isArray(resources?.prizes) && resources.prizes.length > 0;
}

const SECTION_TITLES: Record<Bucket, string> = {
  upcoming: "Upcoming hackathons",
  registration: "Registration open",
  ongoing: "Ongoing hackathons",
  submission: "Submission open",
  evaluation: "Under evaluation",
  completed: "Completed hackathons",
};

const SECTION_DESCRIPTIONS: Record<Bucket, string> = {
  upcoming: "Get ready—these hackathons will open for registration soon.",
  registration: "Register now before the deadline passes.",
  ongoing: "Hackathons are live. Build, collaborate, and innovate.",
  submission: "Submissions are open. Submit your solution before the deadline.",
  evaluation: "Judges are reviewing submissions. Results will be announced soon.",
  completed: "These hackathons have concluded. Check out the results.",
};

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function HackathonsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = getParam(searchParams, "q").trim().toLowerCase();
  const category = getParam(searchParams, "category").trim();
  const statusFilter = getParam(searchParams, "status").trim();
  const mode = getParam(searchParams, "mode").trim();
  const feeMax = Number(getParam(searchParams, "feeMax")) || 0;
  const deadline = getParam(searchParams, "deadline").trim();
  const prizeOnly = getParam(searchParams, "prize") === "true";
  const sort = getParam(searchParams, "sort") || "soonest";

  const allHackathons = await prisma.hackathon.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    include: {
      timelines: { orderBy: { startsAt: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  const categories = await prisma.hackathon.findMany({
    where: { status: { not: "DRAFT" }, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const categoryOptions = categories.map((c) => c.category).filter((c): c is string => Boolean(c));

  const now = new Date();
  const deadlineThreshold = deadline === "thisWeek" ? 7 : deadline === "thisMonth" ? 30 : 0;
  const deadlineCutoff = deadlineThreshold > 0 ? new Date(now.getTime() + deadlineThreshold * 24 * 60 * 60 * 1000) : null;

  const filtered = allHackathons.filter((h) => {
    if (q) {
      const text = [h.title, h.subtitle, h.organizer, h.category, h.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      if (!text.includes(q)) return false;
    }

    if (category && h.category?.toLowerCase() !== category.toLowerCase()) return false;

    if (statusFilter) {
      const bucket = discoveryBucket(h);
      if (bucket !== statusFilter) return false;
    }

    if (mode && h.participationMode !== mode.toUpperCase()) return false;

    if (feeMax > 0 && h.fee > feeMax * 100) return false;

    if (deadlineCutoff) {
      const nd = nextDeadline(h);
      if (!nd || nd.getTime() > deadlineCutoff.getTime()) return false;
    }

    if (prizeOnly && !hasPrize(h)) return false;

    return true;
  });

  function sortHackathons(items: HackathonWithTimelines[]): HackathonWithTimelines[] {
    return [...items].sort((a, b) => {
      if (sort === "popular") return b._count.registrations - a._count.registrations;
      if (sort === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
      const da = nextDeadline(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = nextDeadline(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - db;
    });
  }

  const buckets: Record<Bucket, HackathonWithTimelines[]> = {
    upcoming: [],
    registration: [],
    ongoing: [],
    submission: [],
    evaluation: [],
    completed: [],
  };

  for (const h of filtered) {
    const bucket = discoveryBucket(h);
    buckets[bucket].push(h);
  }

  for (const bucket of Object.keys(buckets) as Bucket[]) {
    buckets[bucket] = sortHackathons(buckets[bucket]);
  }

  const bucketOrder: Bucket[] = ["registration", "submission", "ongoing", "evaluation", "upcoming", "completed"];
  const visibleBuckets = bucketOrder.filter((b) => buckets[b].length > 0);

  const hasActiveFilters = q || category || statusFilter || mode || feeMax > 0 || deadlineCutoff || prizeOnly;

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 lg:py-24">
        <svg
          className="absolute -top-32 -right-32 w-80 opacity-90 pointer-events-none"
          viewBox="0 0 330 300"
          aria-hidden="true"
        >
          <path
            fill="#2E6BFF"
            d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z"
          />
        </svg>
        <Container>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <FadeIn direction="up">
              <Eyebrow className="justify-center">Hackathons</Eyebrow>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
                Compete in MBA case challenges built for
                <span className="text-orange"> real career outcomes</span>.
              </h1>
            </FadeIn>
            <FadeIn direction="up" delay={0.1}>
              <p className="text-lg text-inkSoft max-w-2xl mx-auto mb-8">
                Explore live and upcoming hackathons. Filter by category, status, mode, deadline and prizes to find the
                right challenge.
              </p>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <div className="flex flex-wrap justify-center gap-3">
                <Button href="#hackathons">Explore hackathons</Button>
                <Button href="/mentorship" variant="ghost">
                  Get coaching
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      <section id="hackathons" className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <FadeIn direction="up" className="mb-8">
            <form
              method="GET"
              action="/hackathons"
              className="bg-cream rounded-2xl p-4 sm:p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search hackathons"
                className="rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:border-orange outline-none transition"
              />
              <select
                name="category"
                defaultValue={category}
                className="rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:border-orange outline-none transition"
              >
                <option value="">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                name="status"
                defaultValue={statusFilter}
                className="rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:border-orange outline-none transition"
              >
                <option value="">All statuses</option>
                <option value="registration">Registration open</option>
                <option value="ongoing">Ongoing</option>
                <option value="submission">Submission open</option>
                <option value="evaluation">Under evaluation</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
              <select
                name="mode"
                defaultValue={mode}
                className="rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:border-orange outline-none transition"
              >
                <option value="">All modes</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="TEAM">Team</option>
              </select>
              <input
                type="number"
                name="feeMax"
                defaultValue={feeMax || ""}
                placeholder="Max fee (₹)"
                min={0}
                className="rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:border-orange outline-none transition"
              />
              <select
                name="deadline"
                defaultValue={deadline}
                className="rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:border-orange outline-none transition"
              >
                <option value="">Any deadline</option>
                <option value="thisWeek">Closing this week</option>
                <option value="thisMonth">Closing this month</option>
              </select>
              <select
                name="sort"
                defaultValue={sort}
                className="rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:border-orange outline-none transition"
              >
                <option value="soonest">Closing soonest</option>
                <option value="popular">Most popular</option>
                <option value="newest">Newest</option>
              </select>
              <label className="inline-flex items-center gap-2 text-sm text-charcoal bg-white rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="prize"
                  value="true"
                  defaultChecked={prizeOnly}
                  className="w-4 h-4 accent-orangeDeep"
                />
                Has prizes
              </label>
              <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
                <Button type="submit" size="sm">
                  Apply filters
                </Button>
                {hasActiveFilters && (
                  <Link href="/hackathons" className="inline-flex items-center justify-center rounded-full font-semibold transition active:scale-[0.97] bg-transparent text-charcoal border-[1.5px] border-charcoal/25 hover:border-charcoal px-5 py-2.5 text-sm min-h-[44px]">
                    Reset
                  </Link>
                )}
              </div>
            </form>
          </FadeIn>

          {filtered.length === 0 ? (
            <FadeIn>
              <div className="text-center py-12 bg-cream rounded-2xl">
                <EmptyState label="No hackathons match your filters. Try adjusting your search." />
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-16">
              {visibleBuckets.map((bucket) => (
                <div key={bucket}>
                  <FadeIn direction="up" className="max-w-2xl mb-8">
                    <Eyebrow>{SECTION_TITLES[bucket]}</Eyebrow>
                    <p className="text-inkSoft mt-2">{SECTION_DESCRIPTIONS[bucket]}</p>
                  </FadeIn>
                  <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
                    {buckets[bucket].map((h) => (
                      <StaggerItem key={h.id}>
                        <HackathonCard hackathon={h} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
