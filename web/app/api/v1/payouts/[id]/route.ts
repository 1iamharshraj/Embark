import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, AuthorizedUser } from "@/lib/rbac";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PROCESSED"]),
  adminNote: z.string().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionUser = session.user as AuthorizedUser;
  try {
    requirePermission(sessionUser, "payout.update");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { status, adminNote } = parsed.data;

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, amount: true, status: true },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    if (payout.status === "PROCESSED") {
      return NextResponse.json({ error: "Payout already processed" }, { status: 400 });
    }

    const processedAt = status === "PROCESSED" ? new Date() : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.payout.update({
        where: { id: params.id },
        data: { status, processedAt },
      });

      if (status === "PROCESSED") {
        await tx.walletTransaction.create({
          data: {
            userId: payout.userId,
            type: "DEBIT",
            amount: payout.amount,
            currency: "INR",
            description: `Payout processed${adminNote ? `: ${adminNote}` : ""}`,
            referenceType: "PAYOUT",
            referenceId: payout.id,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payout update error:", error);
    return NextResponse.json({ error: "Failed to update payout" }, { status: 500 });
  }
}
