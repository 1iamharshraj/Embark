import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json({ message: "serviceId is required" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        expertProfile: {
          include: {
            availabilities: true,
            blockedDates: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    if (service.type !== "ONE_ON_ONE") {
      return NextResponse.json({ message: "Slots only available for 1:1 sessions" }, { status: 400 });
    }

    const durationMinutes = service.durationMinutes || 60;
    const bufferMinutes = service.bufferMinutes || 0;

    const existingBookings = await prisma.booking.findMany({
      where: {
        expertId: service.expertProfile.userId,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED", "RESCHEDULED"] },
      },
      select: { scheduledAt: true },
    });

    const bookedStarts = existingBookings.map((b) => new Date(b.scheduledAt));
    const blockedDates = service.expertProfile.blockedDates.map((d) => new Date(d.date));

    const slots = generateSlots(
      service.expertProfile.availabilities.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        timeZone: a.timeZone,
      })),
      durationMinutes,
      bufferMinutes,
      bookedStarts,
      4,
      new Date(),
      blockedDates
    );

    return NextResponse.json({
      slots: slots.map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Slot generation error:", error);
    return NextResponse.json({ message: "Failed to generate slots" }, { status: 500 });
  }
}
