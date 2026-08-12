import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

const updateSchema = z.object({
  status: z.enum(["PENDING", "PUBLISHED", "HIDDEN", "REMOVED"]),
});

async function recalcExpertRating(expertId: string) {
  const published = await prisma.review.findMany({
    where: { expertId, status: "PUBLISHED" },
    select: { rating: true },
  });

  const reviewCount = published.length;
  const rating =
    reviewCount === 0
      ? 0
      : published.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  await prisma.expertProfile.updateMany({
    where: { userId: expertId },
    data: { rating: Math.round(rating * 10) / 10, reviewCount },
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "review.moderate");

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const review = await prisma.review.update({
      where: { id: params.id },
      data: { status },
    });

    await recalcExpertRating(review.expertId);

    return NextResponse.json({ review });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Update review error:", error);
    return NextResponse.json({ message: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "review.moderate");

    const review = await prisma.review.delete({ where: { id: params.id } });
    await recalcExpertRating(review.expertId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Delete review error:", error);
    return NextResponse.json({ message: "Failed to delete review" }, { status: 500 });
  }
}
