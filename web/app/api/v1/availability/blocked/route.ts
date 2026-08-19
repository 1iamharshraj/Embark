import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

const blockedDateSchema = z.object({
  expertProfileId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  reason: z.string().optional(),
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

    const blockedDates = await prisma.blockedDate.findMany({
      where: { expertProfileId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ blockedDates });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to fetch blocked dates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = blockedDateSchema.safeParse(body);

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
      requirePermission(sessionUser, "service.update");
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        expertProfileId: data.expertProfileId,
        date: new Date(data.date),
        reason: data.reason?.trim() || null,
      },
    });

    return NextResponse.json({ blockedDate }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to create blocked date" }, { status: 500 });
  }
}
