import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const eventSchema = z.object({
  event: z.enum(["PROFILE_VIEW", "SERVICE_VIEW", "CHECKOUT_START"]),
  expertId: z.string().optional(),
  serviceId: z.string().optional(),
  dmId: z.string().optional(),
  bookingId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const event = await prisma.analyticsEvent.create({
      data: {
        event: data.event,
        expertId: data.expertId || null,
        serviceId: data.serviceId || null,
        dmId: data.dmId || null,
        bookingId: data.bookingId || null,
        metadata: (data.metadata || undefined) as unknown as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Analytics event creation error:", error);
    return NextResponse.json({ message: "Failed to record event" }, { status: 500 });
  }
}
