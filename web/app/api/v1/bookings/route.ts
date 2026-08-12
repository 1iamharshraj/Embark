import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission, AuthorizedUser } from "@/lib/rbac";

const createSchema = z.object({
  serviceId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  intakeResponses: z.record(z.string()).default({}),
});

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "booking.view");

    const bookings = await prisma.booking.findMany({
      where: user.isAdmin
        ? {}
        : {
            OR: [{ clientId: user.id }, { expertId: user.id }],
          },
      include: {
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        client: { select: { id: true, name: true, email: true } },
        expert: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const sessionUser = session.user as AuthorizedUser;

    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: { expertProfile: { select: { userId: true } } },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    if (service.type !== "ONE_ON_ONE") {
      return NextResponse.json({ message: "Booking is only for 1:1 services" }, { status: 400 });
    }

    if (!service.durationMinutes) {
      return NextResponse.json({ message: "Service duration is required" }, { status: 400 });
    }

    const scheduledAt = new Date(data.scheduledAt);

    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findFirst({
        where: {
          expertId: service.expertProfile.userId,
          scheduledAt,
          status: { in: ["PENDING_PAYMENT", "CONFIRMED", "RESCHEDULED"] },
        },
      });

      if (existing) {
        throw new Error("SLOT_TAKEN");
      }

      return tx.booking.create({
        data: {
          serviceId: data.serviceId,
          clientId: sessionUser.id,
          expertId: service.expertProfile.userId,
          scheduledAt,
          durationMinutes: service.durationMinutes || 60,
          amount: service.price,
          intakeResponses: data.intakeResponses,
          status: "PENDING_PAYMENT",
        },
        include: {
          service: { select: { id: true, name: true, durationMinutes: true, price: true } },
          client: { select: { id: true, name: true } },
          expert: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return NextResponse.json({ message: "This slot is no longer available" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Booking creation error:", error);
    return NextResponse.json({ message: "Failed to create booking" }, { status: 500 });
  }
}
