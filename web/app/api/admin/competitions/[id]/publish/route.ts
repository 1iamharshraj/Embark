import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.update");

    const competition = await prisma.competition.findUnique({ where: { id: params.id } });
    if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.competition.update({
      where: { id: params.id },
      data: { draft: false },
    });

    return NextResponse.json({ competition: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to publish competition" }, { status: 500 });
  }
}
