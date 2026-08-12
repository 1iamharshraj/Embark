import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));

    if (body.action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Mark all read error:", error);
    return NextResponse.json({ message: "Failed to mark notifications read" }, { status: 500 });
  }
}
