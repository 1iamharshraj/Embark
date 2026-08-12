import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  durationMinutes: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  bufferMinutes: z.coerce.number().min(0).optional(),
  cancellationPolicy: z.string().optional(),
  intakeQuestions: z.array(z.string()).optional(),
  meetingMethod: z.enum(["GOOGLE_MEET", "ZOOM", "PHONE", "OTHER"]).optional(),
  isActive: z.boolean().optional(),
});

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
      where: { id: params.id, isActive: true },
      include: {
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

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        description: parsed.data.description?.trim(),
        category: parsed.data.category?.trim(),
        cancellationPolicy: parsed.data.cancellationPolicy?.trim(),
      },
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
