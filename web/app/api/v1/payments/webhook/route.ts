import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { getDefaultCommissionRate, calculateCommission } from "@/lib/commission";
import { unlockAfterPayment } from "@/lib/paymentUnlock";

export const dynamic = "force-dynamic";

interface PaymentEntity {
  order_id?: string;
  id?: string;
}

interface RefundEntity {
  id?: string;
  payment_id?: string;
  status?: string;
}

interface WebhookPayload {
  event?: string;
  payload?: {
    payment?: { entity?: PaymentEntity };
    refund?: { entity?: RefundEntity };
  };
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const expectedSignature = createHmac("sha256", secret).update(body).digest("hex");
  if (!signature || signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const refundEntity = event.payload?.refund?.entity;

    if (eventType === "payment.captured" && paymentEntity?.order_id) {
      await capturePayment(paymentEntity.order_id, paymentEntity.id || "unknown");
    } else if (eventType === "payment.failed" && paymentEntity?.order_id) {
      await failPayment(paymentEntity.order_id);
    } else if (eventType === "refund.processed" && refundEntity?.id && refundEntity?.payment_id) {
      await markRefundProcessed(refundEntity.id, refundEntity.payment_id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function capturePayment(razorpayOrderId: string, razorpayPaymentId: string) {
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId },
    include: {
      payment: true,
      booking: { select: { expertId: true } },
      dm: { select: { expertId: true } },
    },
  });

  if (!order || order.status !== "pending") return;
  if (order.payment) return;

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
      where: { id: order.id },
      data: {
        status: "paid",
        paymentId: razorpayPaymentId,
      },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        status: "CAPTURED",
        razorpayPaymentId,
        amount: order.amount,
        capturedAt: new Date(),
      },
    });

    await tx.commission.create({
      data: {
        orderId: order.id,
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
          referenceId: order.id,
        },
      });
    }

    await unlockAfterPayment(tx, order.orderType, order.relatedId, order, platformAmount, expertAmount);
  });
}

async function failPayment(razorpayOrderId: string) {
  await prisma.order.updateMany({
    where: { razorpayOrderId, status: "pending" },
    data: { status: "failed" },
  });
}

async function markRefundProcessed(razorpayRefundId: string, razorpayPaymentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { razorpayPaymentId },
    include: { order: true },
  });
  if (!payment) return;

  await prisma.refund.updateMany({
    where: { orderId: payment.orderId, status: "PENDING" },
    data: { status: "PROCESSED", razorpayRefundId, processedAt: new Date() },
  });
}

function getExpertUserId(order: {
  orderType: string;
  booking: { expertId: string } | null;
  dm: { expertId: string } | null;
}): string | null {
  if (order.orderType === "BOOKING") return order.booking?.expertId ?? null;
  if (order.orderType === "PRIORITY_DM") return order.dm?.expertId ?? null;
  return null;
}
