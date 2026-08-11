import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "dashboard.view");

    const [mentorship, speakers, lectures] = await Promise.all([
      prisma.bookingRequest.count({ where: { status: "pending" } }),
      prisma.speakerApplication.count({ where: { status: "pending" } }),
      prisma.lectureRequest.count({ where: { status: "pending" } }),
    ]);

    return NextResponse.json({
      counts: { mentorship, speakers, lectures, total: mentorship + speakers + lectures },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}
