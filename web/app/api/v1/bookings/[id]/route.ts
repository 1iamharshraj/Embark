import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { AuthorizedUser } from "@/lib/rbac";

const updateSchema = z.object({
  status: z.enum(["CANCELLED", "RESCHEDULE_REQUESTED", "CONFIRMED", "COMPLETED"]),
  cancellationReason: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

async function canModify(sessionUser: AuthorizedUser, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, clientId: true, expertId: true, status: true },
  });

  if (!booking) return { error: "Booking not found", status: 404 };

  const isClient = booking.clientId === sessionUser.id;
  const isExpert = booking.expertId === sessionUser.id;

  if (!sessionUser.isAdmin && !isClient && !isExpert) {
    return { error: "Forbidden", status: 403 };
  }

  return { booking, isClient, isExpert };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const { status, cancellationReason, scheduledAt } = parsed.data;
    const sessionUser = session.user as AuthorizedUser;
    const result = await canModify(sessionUser, params.id);

    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const { isClient, isExpert } = result;

    // Permission checks by action
    if (status === "CANCELLED" && !isClient && !sessionUser.isAdmin) {
      return NextResponse.json({ message: "Only the client or admin can cancel" }, { status: 403 });
    }
    if ((status === "CONFIRMED" || status === "COMPLETED") && !isExpert && !sessionUser.isAdmin) {
      return NextResponse.json({ message: "Only the expert or admin can confirm/complete" }, { status: 403 });
    }

    const data: Record<string, unknown> = { status };
    if (cancellationReason) data.cancellationReason = cancellationReason;
    if (scheduledAt) data.scheduledAt = new Date(scheduledAt);

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data,
      include: {
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        client: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json({ message: "Failed to update booking" }, { status: 500 });
  }
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: { select: { id: true, name: true, durationMinutes: true, price: true, intakeQuestions: true } },
        client: { select: { id: true, name: true, email: true } },
        expert: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    const sessionUser = session.user as AuthorizedUser;
    if (!sessionUser.isAdmin && booking.clientId !== sessionUser.id && booking.expertId !== sessionUser.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch booking" }, { status: 500 });
  }
}
