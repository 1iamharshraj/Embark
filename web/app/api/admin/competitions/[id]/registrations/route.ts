import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.view");

    const registrations = await prisma.registration.findMany({
      where: { compId: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, college: true } },
        submissions: { orderBy: { roundIdx: "asc" } },
        advancements: true,
        winner: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}
