import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

const intakeQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.enum(["text", "long", "dropdown", "multi", "file", "url"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

const serviceSchema = z.object({
  expertProfileId: z.string().min(1),
  type: z.enum(["ONE_ON_ONE", "PRIORITY_DM", "PACKAGE"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  outcomes: z.array(z.string()).default([]),
  durationMinutes: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0),
  currency: z.string().default("INR"),
  bufferMinutes: z.coerce.number().min(0).default(0),
  cancellationPolicy: z.string().optional(),
  intakeQuestions: z.union([z.array(z.string()), z.array(intakeQuestionSchema)]).default([]),
  meetingMethod: z.enum(["GOOGLE_MEET", "ZOOM", "PHONE", "OTHER"]).optional(),
  responseSlaHours: z.coerce.number().int().min(1).default(48),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "ARCHIVED"]).default("DRAFT"),
});

function isActiveFromStatus(status: string) {
  return status === "PUBLISHED";
}

function normalizeIntakeQuestions(questions: z.infer<typeof serviceSchema>["intakeQuestions"]) {
  if (!questions || questions.length === 0) return [];
  if (typeof questions[0] === "string") {
    return (questions as string[]).map((q) => ({ question: q, type: "text", required: false }));
  }
  return questions as z.infer<typeof intakeQuestionSchema>[];
}

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "service.view");

    const services = await prisma.service.findMany({
      where: user.isAdmin ? undefined : { expertProfile: { userId: user.id } },
      include: {
        expertProfile: { select: { id: true, userId: true, headline: true } },
        analytics: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { id: data.expertProfileId },
    });

    if (!expertProfile) {
      return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
    }

    const user = session.user as AuthorizedUser;
    if (!user.isAdmin) {
      requireResourceOwner(user, expertProfile.userId);
      requirePermission(user, "service.create");
    }

    const isActive = isActiveFromStatus(data.status);
    const archivedAt = data.status === "ARCHIVED" ? new Date() : null;

    const service = await prisma.service.create({
      data: {
        expertProfileId: data.expertProfileId,
        createdById: user.id,
        type: data.type,
        name: data.name.trim(),
        description: data.description?.trim(),
        category: data.category?.trim(),
        outcomes: data.outcomes.map((o) => o.trim()).filter(Boolean),
        durationMinutes: data.durationMinutes,
        price: data.price,
        currency: data.currency,
        bufferMinutes: data.bufferMinutes,
        cancellationPolicy: data.cancellationPolicy?.trim(),
        intakeQuestions: normalizeIntakeQuestions(data.intakeQuestions),
        meetingMethod: data.meetingMethod,
        responseSlaHours: data.responseSlaHours,
        status: data.status,
        isActive,
        archivedAt,
        analytics: {
          create: {},
        },
      },
      include: { analytics: true },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to create service" }, { status: 500 });
  }
}
