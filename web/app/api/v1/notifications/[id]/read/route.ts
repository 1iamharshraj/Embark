import { NextResponse } from "next/server";
import { requireAuth, requireResourceOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    requireResourceOwner(user, notification.userId);

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    });

    return NextResponse.json({ notification: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Mark notification read error:", error);
    return NextResponse.json({ message: "Failed to mark notification read" }, { status: 500 });
  }
}
