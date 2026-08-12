import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { createHmac } from "crypto";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isTestRazorpaySecret } from "@/lib/razorpay";
import { getDefaultCommissionRate, calculateCommission } from "@/lib/commission";
import { unlockAfterPayment } from "@/lib/paymentUnlock";

const verifySchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  dbOrderId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, dbOrderId } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: {
        booking: { select: { expertId: true } },
        dm: { select: { expertId: true } },
        purchase: { select: { id: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ ok: true, status: "paid" });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is not pending" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const expectedSignature = secret
      ? createHmac("sha256", secret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex")
      : "";

    const isTestMode = isTestRazorpaySecret() || !secret;
    const signatureMatches = expectedSignature && expectedSignature === razorpay_signature;

    if (!signatureMatches && !isTestMode) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    let expertUserId = getExpertUserId(order);
    if (!expertUserId && order.orderType === "PACKAGE" && order.relatedId) {
      const pkg = await prisma.package.findUnique({
        where: { id: order.relatedId },
        include: { expertProfile: { select: { userId: true } } },
      });
      expertUserId = pkg?.expertProfile.userId ?? null;
    }

    const commissionRate = expertUserId ? await getDefaultCommissionRate() : 1;
    const { platformAmount, expertAmount } = expertUserId
      ? calculateCommission(order.amount, commissionRate)
      : { platformAmount: order.amount, expertAmount: 0 };

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: dbOrderId },
        data: {
          status: "paid",
          paymentId: razorpay_payment_id,
          paymentSignature: razorpay_signature,
        },
      });

      await tx.payment.create({
        data: {
          orderId: dbOrderId,
          status: "CAPTURED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: order.amount,
          capturedAt: new Date(),
        },
      });

      await tx.commission.create({
        data: {
          orderId: dbOrderId,
          rate: commissionRate,
          platformAmount,
          expertAmount,
        },
      });

      if (expertUserId) {
        await tx.walletTransaction.create({
          data: {
            userId: expertUserId,
            type: "CREDIT",
            amount: expertAmount,
            currency: "INR",
            description: `Earnings for ${order.orderType} #${order.relatedId ?? ""}`,
            referenceType: "ORDER",
            referenceId: dbOrderId,
          },
        });
      }

      await unlockAfterPayment(tx, order.orderType, order.relatedId, order, platformAmount, expertAmount);
    });

    return NextResponse.json({ ok: true, status: "paid" });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}

function getExpertUserId(order: {
  orderType: string;
  booking: { expertId: string } | null;
  dm: { expertId: string } | null;
}): string | null {
  if (order.orderType === "BOOKING") return order.booking?.expertId ?? null;
  if (order.orderType === "PRIORITY_DM") return order.dm?.expertId ?? null;
  // For packages/mentorship/playbooks the expert/owner is resolved later or not needed for wallet credit yet.
  return null;
}
