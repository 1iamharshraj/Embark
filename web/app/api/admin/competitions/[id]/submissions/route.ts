import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.view");

    const submissions = await prisma.submission.findMany({
      where: { compId: params.id },
      include: {
        registration: { select: { teamName: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { roundIdx: "asc" },
    });

    const withLinks = submissions.map((s) => ({
      ...s,
      downloadUrl: s.filePath ? `/api/submissions/${s.id}/download` : null,
    }));

    return NextResponse.json({ submissions: withLinks });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
