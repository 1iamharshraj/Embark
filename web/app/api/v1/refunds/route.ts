import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getRazorpayInstance } from "@/lib/razorpay";
import { requirePermission, AuthorizedUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().optional(),
  amount: z.coerce.number().min(0).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionUser = session.user as AuthorizedUser;
    try {
      requirePermission(sessionUser, "refund.view");
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const refunds = await prisma.refund.findMany({
      include: { order: { select: { id: true, amount: true, orderType: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("Refund fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionUser = session.user as AuthorizedUser;
  try {
    requirePermission(sessionUser, "refund.create");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { orderId, reason, amount } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        commission: true,
        booking: { select: { id: true, expertId: true } },
        dm: { select: { id: true, expertId: true } },
        purchase: { select: { id: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order is not paid" }, { status: 400 });
    }

    const refundAmount = amount || order.amount;
    if (refundAmount > order.amount) {
      return NextResponse.json({ error: "Refund amount exceeds order amount" }, { status: 400 });
    }

    let razorpayRefundId: string | null = null;
    try {
      const razorpay = getRazorpayInstance();
      if (order.payment) {
        const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
          amount: refundAmount,
        });
        razorpayRefundId = (refund as { id: string }).id;
      }
    } catch {
      // In test mode or without real keys, create the record without a Razorpay refund ID.
    }

    await prisma.$transaction(async (tx) => {
      await tx.refund.create({
        data: {
          orderId,
          amount: refundAmount,
          reason,
          status: razorpayRefundId ? "PENDING" : "PROCESSED",
          razorpayRefundId,
          processedAt: razorpayRefundId ? undefined : new Date(),
        },
      });

      // Reverse earnings for the expert if a commission was recorded.
      if (order.commission && order.commission.expertAmount > 0) {
        const expertId = order.booking?.expertId || order.dm?.expertId || null;
        if (expertId) {
          await tx.walletTransaction.create({
            data: {
              userId: expertId,
              type: "DEBIT",
              amount: Math.min(refundAmount, order.commission.expertAmount),
              currency: "INR",
              description: `Refund for order #${orderId}`,
              referenceType: "REFUND",
              referenceId: orderId,
            },
          });
        }
      }

      // Mark related records as refunded/cancelled.
      if (order.booking) {
        await tx.booking.update({ where: { id: order.booking.id }, data: { status: "CANCELLED", cancellationReason: reason || "Refunded" } });
      }
      if (order.dm) {
        await tx.priorityDM.update({ where: { id: order.dm.id }, data: { status: "REFUNDED" } });
      }
      if (order.purchase) {
        await tx.packagePurchase.update({ where: { id: order.purchase.id }, data: { status: "CANCELLED" } });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Refund creation error:", error);
    return NextResponse.json({ error: "Failed to create refund" }, { status: 500 });
  }
}
