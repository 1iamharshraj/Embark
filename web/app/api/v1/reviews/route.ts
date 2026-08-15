import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

const createSchema = z.object({
  bookingId: z.string().optional(),
  dmId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).optional(),
}).refine(
  (data) => (data.bookingId && !data.dmId) || (!data.bookingId && data.dmId),
  { message: "Provide either bookingId or dmId", path: ["bookingId"] }
);

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get("expertId");
    const status = searchParams.get("status") || undefined;

    const where: {
      expertId?: string;
      status?: string;
      studentId?: string;
      OR?: Array<{ studentId: string } | { expertId: string }>;
    } = {};

    if (expertId) where.expertId = expertId;
    if (status) where.status = status;
    if (!user.isAdmin && status !== "PUBLISHED") {
      // Non-admins can see reviews they wrote or reviews written about them.
      where.OR = [
        { studentId: user.id },
        { expertId: user.id },
      ];
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, image: true } },
        expert: { select: { id: true, name: true, email: true, image: true } },
        booking: { select: { id: true, status: true, scheduledAt: true } },
        dm: { select: { id: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ message: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { bookingId, dmId, rating, text } = parsed.data;

    const existing = await prisma.review.findFirst({
      where: bookingId ? { bookingId } : { dmId },
    });
    if (existing) {
      return NextResponse.json(
        { message: "You have already reviewed this service" },
        { status: 409 }
      );
    }

    let expertId: string;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: { select: { expertProfileId: true } } },
      });
      if (!booking || booking.clientId !== user.id) {
        return NextResponse.json({ message: "Booking not found" }, { status: 404 });
      }
      if (booking.status !== "COMPLETED") {
        return NextResponse.json(
          { message: "Booking must be completed before reviewing" },
          { status: 400 }
        );
      }
      const profile = await prisma.expertProfile.findUnique({
        where: { id: booking.service.expertProfileId },
        select: { userId: true },
      });
      if (!profile) {
        return NextResponse.json({ message: "Expert not found" }, { status: 404 });
      }
      expertId = profile.userId;
    } else if (dmId) {
      const dm = await prisma.priorityDM.findUnique({ where: { id: dmId } });
      if (!dm || dm.studentId !== user.id) {
        return NextResponse.json({ message: "DM not found" }, { status: 404 });
      }
      if (dm.status !== "COMPLETED" && dm.status !== "RESPONDED") {
        return NextResponse.json(
          { message: "DM must be completed before reviewing" },
          { status: 400 }
        );
      }
      expertId = dm.expertId;
    } else {
      return NextResponse.json(
        { message: "bookingId or dmId is required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        studentId: user.id,
        expertId,
        bookingId: bookingId || null,
        dmId: dmId || null,
        rating,
        text: text?.trim() || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Create review error:", error);
    return NextResponse.json({ message: "Failed to create review" }, { status: 500 });
  }
}
