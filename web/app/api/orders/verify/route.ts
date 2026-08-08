import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import { isTestRazorpaySecret } from "@/lib/razorpay";
import { z } from "zod";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

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
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  if (signatureMatches || isTestMode) {
    await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        status: "paid",
        paymentId: razorpay_payment_id,
        paymentSignature: razorpay_signature,
      },
    });

    return NextResponse.json({ ok: true, status: "paid" });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 400 });
}
