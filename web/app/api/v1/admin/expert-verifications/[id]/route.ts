import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notifyExpertVerification } from "@/lib/notifications";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  note: z.string().optional(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "expert.verify");

    const verification = await prisma.expertVerification.findUnique({
      where: { id: params.id },
      include: {
        expertProfile: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ message: "Verification not found" }, { status: 404 });
    }

    return NextResponse.json({ verification });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to fetch verification" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "expert.verify");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { status, note } = parsed.data;

    const verification = await prisma.expertVerification.findUnique({
      where: { id: params.id },
      include: {
        expertProfile: {
          include: { user: { select: { id: true } } },
        },
      },
    });
    if (!verification) {
      return NextResponse.json({ message: "Verification not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.expertVerification.update({
        where: { id: params.id },
        data: {
          status,
          adminNote: note?.trim() || null,
          reviewedById: user.id,
          reviewedAt: new Date(),
        },
      });

      await tx.expertProfile.update({
        where: { id: verification.expertProfileId },
        data: {
          verificationStatus: status,
          verificationNote: note?.trim() || null,
          isPublic: status === "VERIFIED",
        },
      });
    });

    await notifyExpertVerification(
      verification.expertProfile.user.id,
      verification.expertProfileId,
      status,
      note
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to review verification" }, { status: 500 });
  }
}
