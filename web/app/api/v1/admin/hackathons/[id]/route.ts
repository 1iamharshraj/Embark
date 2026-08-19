import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

const HACKATHON_STATUSES = [
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

const HACKATHON_TIMELINE_PHASES = [
  "REGISTRATION",
  "HACKATHON",
  "SUBMISSION",
  "EVALUATION",
  "RESULT",
  "CERTIFICATE",
] as const;

const timelineSchema = z.object({
  id: z.string().optional(),
  phase: z.enum(HACKATHON_TIMELINE_PHASES),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
});

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  banner: z.string().optional(),
  bannerUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  status: z.enum(HACKATHON_STATUSES).optional(),
  shortDescription: z.string().optional(),
  detailedDescription: z.string().optional(),
  organizer: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  participationMode: z.enum(["INDIVIDUAL", "TEAM"]).optional(),
  teamMin: z.number().int().min(1).optional(),
  teamMax: z.number().int().min(1).optional(),
  eligibility: z.record(z.any()).optional(),
  fee: z.number().int().min(0).optional(),
  rules: z.record(z.any()).optional(),
  problemStatement: z.record(z.any()).optional(),
  evaluationCriteria: z.record(z.any()).optional(),
  resources: z.record(z.any()).optional(),
  faqs: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  timelines: z.array(timelineSchema).optional(),
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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.view");

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        timelines: { orderBy: { startsAt: "asc" } },
        _count: {
          select: { registrations: true, teams: true, submissions: true },
        },
      },
    });

    if (!hackathon) {
      return NextResponse.json({ message: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({ hackathon });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Fetch hackathon error:", error);
    return NextResponse.json({ message: "Failed to fetch hackathon" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.update");

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { timelines, ...data } = parsed.data;

    if (data.slug) {
      const existing = await prisma.hackathon.findFirst({
        where: { slug: data.slug, NOT: { id: params.id } },
      });
      if (existing) {
        return NextResponse.json({ message: "Slug already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (timelines) {
        await tx.hackathonTimeline.deleteMany({ where: { hackathonId: params.id } });
      }

      return tx.hackathon.update({
        where: { id: params.id },
        data: {
          ...data,
          timelines: timelines
            ? {
                create: timelines.map((t) => ({
                  phase: t.phase,
                  startsAt: new Date(t.startsAt),
                  endsAt: t.endsAt ? new Date(t.endsAt) : null,
                })),
              }
            : undefined,
        },
        include: { timelines: { orderBy: { startsAt: "asc" } } },
      });
    });

    return NextResponse.json({ hackathon: updated });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Update hackathon error:", error);
    return NextResponse.json({ message: "Failed to update hackathon" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "hackathon.delete");

    await prisma.hackathon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Delete hackathon error:", error);
    return NextResponse.json({ message: "Failed to delete hackathon" }, { status: 500 });
  }
}
