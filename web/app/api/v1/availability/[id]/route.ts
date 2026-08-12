import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

const updateSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm format").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm format").optional(),
  timeZone: z.string().optional(),
});

async function canModifyAvailability(sessionUser: AuthorizedUser, id: string) {
  const availability = await prisma.serviceAvailability.findUnique({
    where: { id },
    include: { expertProfile: { select: { userId: true } } },
  });

  if (!availability) return { error: "Availability not found", status: 404 };

  if (!sessionUser.isAdmin) {
    requireResourceOwner(sessionUser, availability.expertProfile.userId);
    requirePermission(sessionUser, "service.update");
  }

  return { availability };
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

    const result = await canModifyAvailability(session.user as AuthorizedUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const updated = await prisma.serviceAvailability.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ availability: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to update availability" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await canModifyAvailability(session.user as AuthorizedUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    await prisma.serviceAvailability.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to delete availability" }, { status: 500 });
  }
}
