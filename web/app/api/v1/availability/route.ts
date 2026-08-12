import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

const availabilitySchema = z.object({
  expertProfileId: z.string().min(1),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm format"),
  timeZone: z.string().default("Asia/Kolkata"),
});

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "service.view");

    const { searchParams } = new URL(request.url);
    const expertProfileId = searchParams.get("expertProfileId");

    if (!expertProfileId) {
      return NextResponse.json({ message: "expertProfileId is required" }, { status: 400 });
    }

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { id: expertProfileId },
      select: { userId: true },
    });

    if (!expertProfile) {
      return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
    }

    if (!user.isAdmin) {
      requireResourceOwner(user, expertProfile.userId);
    }

    const availabilities = await prisma.serviceAvailability.findMany({
      where: { expertProfileId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ availabilities });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to fetch availability" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = availabilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { id: data.expertProfileId },
      select: { userId: true },
    });

    if (!expertProfile) {
      return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
    }

    const sessionUser = session.user as AuthorizedUser;
    if (!sessionUser.isAdmin) {
      requireResourceOwner(sessionUser, expertProfile.userId);
      requirePermission(sessionUser, "service.create");
    }

    const availability = await prisma.serviceAvailability.create({
      data: {
        expertProfileId: data.expertProfileId,
        createdById: sessionUser.id,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        timeZone: data.timeZone,
      },
    });

    return NextResponse.json({ availability }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to create availability" }, { status: 500 });
  }
}
