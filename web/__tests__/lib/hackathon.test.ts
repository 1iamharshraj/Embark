import {
  hackathonStatus,
  registrationOpen,
  submissionOpen,
  displayStatus,
  submissionDeadline,
  statusBadgeClass,
} from "@/lib/hackathon";
import type { Hackathon, HackathonTimeline } from "@prisma/client";

function makeHackathon(
  timelines: Partial<HackathonTimeline>[]
): Hackathon & { timelines: HackathonTimeline[] } {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id: "h1",
    title: "Test Hackathon",
    slug: "test-hackathon",
    createdAt: yesterday,
    updatedAt: yesterday,
    timelines: timelines.map((t, i) => ({
      id: `tl${i}`,
      hackathonId: "h1",
      phase: t.phase || "REGISTRATION",
      startsAt: t.startsAt || yesterday,
      endsAt: t.endsAt || tomorrow,
      createdAt: yesterday,
      updatedAt: yesterday,
    })) as HackathonTimeline[],
  } as Hackathon & { timelines: HackathonTimeline[] };
}

describe("hackathonStatus", () => {
  it("returns REGISTRATION when currently in registration phase", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const hackathon = makeHackathon([
      { phase: "REGISTRATION", startsAt: yesterday, endsAt: tomorrow },
    ]);
    expect(hackathonStatus(hackathon)).toBe("REGISTRATION");
  });

  it("returns UPCOMING before the first phase", () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const hackathon = makeHackathon([
      { phase: "REGISTRATION", startsAt: tomorrow, endsAt: dayAfter },
    ]);
    expect(hackathonStatus(hackathon)).toBe("UPCOMING");
  });

  it("returns CLOSED after all phases end", () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const hackathon = makeHackathon([
      { phase: "REGISTRATION", startsAt: threeDaysAgo, endsAt: twoDaysAgo },
    ]);
    expect(hackathonStatus(hackathon)).toBe("CLOSED");
  });
});

describe("registrationOpen", () => {
  it("returns true during registration phase", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expect(
      registrationOpen(
        makeHackathon([{ phase: "REGISTRATION", startsAt: yesterday, endsAt: tomorrow }])
      )
    ).toBe(true);
  });

  it("returns false outside registration phase", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expect(
      submissionOpen(
        makeHackathon([{ phase: "REGISTRATION", startsAt: yesterday, endsAt: tomorrow }])
      )
    ).toBe(false);
  });
});

describe("displayStatus", () => {
  it("returns human-readable labels", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expect(
      displayStatus(makeHackathon([{ phase: "REGISTRATION", startsAt: yesterday, endsAt: tomorrow }]))
    ).toBe("Registration open");
  });
});

describe("submissionDeadline", () => {
  it("returns the submission phase end date", () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const hackathon = makeHackathon([
      { phase: "SUBMISSION", startsAt: now, endsAt: tomorrow },
    ]);
    expect(submissionDeadline(hackathon)).toEqual(tomorrow);
  });

  it("returns null when there is no submission phase", () => {
    expect(submissionDeadline(makeHackathon([]))).toBeNull();
  });
});

describe("statusBadgeClass", () => {
  it("returns a class string for known statuses", () => {
    expect(statusBadgeClass("REGISTRATION")).toContain("green");
    expect(statusBadgeClass("SUBMISSION")).toContain("blue");
  });

  it("returns a default class for unknown statuses", () => {
    expect(statusBadgeClass("UNKNOWN")).toContain("gray");
  });
});
