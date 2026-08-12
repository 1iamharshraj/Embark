import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "expert.view");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const experts = await prisma.expertProfile.findMany({
      where: status ? { verificationStatus: status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      experts: experts.map((e) => ({
        id: e.id,
        userId: e.userId,
        name: e.user.name,
        email: e.user.email,
        image: e.user.image,
        headline: e.headline,
        verificationStatus: e.verificationStatus,
        createdAt: e.createdAt.toISOString(),
        latestVerification: e.verifications[0] || null,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to fetch experts" }, { status: 500 });
  }
}
