import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

const timelineSchema = z.object({
  phase: z.enum(["REGISTRATION", "SUBMISSION", "EVALUATION", "RESULT"]),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
});

const hackathonSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  banner: z.string().optional(),
  bannerUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "SUBMISSION_OPEN", "EVALUATION", "RESULTS_PUBLISHED", "CLOSED"]),
  shortDescription: z.string().optional(),
  detailedDescription: z.string().optional(),
  organizer: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  participationMode: z.enum(["INDIVIDUAL", "TEAM"]).default("TEAM"),
  teamMin: z.number().int().min(1).default(1),
  teamMax: z.number().int().min(1).default(4),
  eligibility: z.record(z.any()).default({}),
  fee: z.number().int().min(0).default(0),
  rules: z.record(z.any()).default({}),
  problemStatement: z.record(z.any()).default({}),
  evaluationCriteria: z.record(z.any()).default({}),
  resources: z.record(z.any()).default({}),
  faqs: z.record(z.any()).default({}),
  settings: z.record(z.any()).default({}),
  timelines: z.array(timelineSchema).default([]),
});

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.view");

    const hackathons = await prisma.hackathon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { registrations: true, teams: true, submissions: true },
        },
      },
    });

    return NextResponse.json({ hackathons });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Fetch hackathons error:", error);
    return NextResponse.json({ message: "Failed to fetch hackathons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.create");

    const body = await request.json();
    const parsed = hackathonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { timelines, ...data } = parsed.data;

    const existing = await prisma.hackathon.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ message: "Slug already in use" }, { status: 409 });
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        ...data,
        timelines: {
          create: timelines.map((t) => ({
            phase: t.phase,
            startsAt: new Date(t.startsAt),
            endsAt: t.endsAt ? new Date(t.endsAt) : null,
          })),
        },
      },
      include: { timelines: true },
    });

    return NextResponse.json({ hackathon }, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Create hackathon error:", error);
    return NextResponse.json({ message: "Failed to create hackathon" }, { status: 500 });
  }
}
