import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

const intakeQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.enum(["text", "long", "dropdown", "multi", "file", "url"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  outcomes: z.array(z.string()).optional(),
  durationMinutes: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  bufferMinutes: z.coerce.number().min(0).optional(),
  cancellationPolicy: z.string().optional(),
  intakeQuestions: z.union([z.array(z.string()), z.array(intakeQuestionSchema)]).optional(),
  meetingMethod: z.enum(["GOOGLE_MEET", "ZOOM", "PHONE", "OTHER"]).optional(),
  responseSlaHours: z.coerce.number().int().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "ARCHIVED"]).optional(),
  isActive: z.boolean().optional(),
});

function isActiveFromStatus(status: string) {
  return status === "PUBLISHED";
}

function normalizeIntakeQuestions(questions: z.infer<typeof updateSchema>["intakeQuestions"]) {
  if (!questions || questions.length === 0) return [];
  if (typeof questions[0] === "string") {
    return (questions as string[]).map((q) => ({ question: q, type: "text", required: false }));
  }
  return questions as z.infer<typeof intakeQuestionSchema>[];
}

async function canModifyService(sessionUser: AuthorizedUser, serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { expertProfile: { select: { userId: true } } },
  });

  if (!service) return { error: "Service not found", status: 404 };

  if (!sessionUser.isAdmin) {
    requireResourceOwner(sessionUser, service.expertProfile.userId);
    requirePermission(sessionUser, "service.update");
  }

  return { service };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id, status: "PUBLISHED" },
      include: {
        analytics: true,
        expertProfile: {
          select: {
            id: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    // Track public view asynchronously (fire-and-forget)
    prisma.serviceAnalytics
      .updateMany({
        where: { serviceId: service.id },
        data: { views: { increment: 1 }, updatedAt: new Date() },
      })
      .catch(() => {});

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const result = await canModifyService(session.user as AuthorizedUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {
      name: data.name?.trim(),
      description: data.description?.trim(),
      category: data.category?.trim(),
      durationMinutes: data.durationMinutes,
      price: data.price,
      bufferMinutes: data.bufferMinutes,
      cancellationPolicy: data.cancellationPolicy?.trim(),
      meetingMethod: data.meetingMethod,
      responseSlaHours: data.responseSlaHours,
    };

    if (data.outcomes) {
      updateData.outcomes = data.outcomes.map((o) => o.trim()).filter(Boolean);
    }

    if (data.intakeQuestions) {
      updateData.intakeQuestions = normalizeIntakeQuestions(data.intakeQuestions);
    }

    if (data.status) {
      updateData.status = data.status;
      updateData.isActive = isActiveFromStatus(data.status);
      if (data.status === "ARCHIVED") {
        updateData.archivedAt = new Date();
      } else {
        updateData.archivedAt = null;
      }
    } else if (typeof data.isActive === "boolean") {
      // Legacy toggle: keep existing status mapping where possible
      updateData.isActive = data.isActive;
      const currentStatus = result.service.status;
      if (!data.isActive && currentStatus === "PUBLISHED") {
        updateData.status = "PAUSED";
      } else if (data.isActive && currentStatus !== "PUBLISHED") {
        updateData.status = "PUBLISHED";
        updateData.archivedAt = null;
      }
    }

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: updateData,
      include: { analytics: true },
    });

    return NextResponse.json({ service: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await canModifyService(session.user as AuthorizedUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    await prisma.service.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to delete service" }, { status: 500 });
  }
}
