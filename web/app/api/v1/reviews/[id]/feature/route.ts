import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

const updateSchema = z.object({
  isFeatured: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    if (review.expertId !== user.id && !user.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (review.status !== "PUBLISHED" && parsed.data.isFeatured) {
      return NextResponse.json(
        { message: "Only published reviews can be featured" },
        { status: 400 }
      );
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isFeatured: parsed.data.isFeatured },
    });

    return NextResponse.json({ review: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Feature review error:", error);
    return NextResponse.json({ message: "Failed to update review" }, { status: 500 });
  }
}
