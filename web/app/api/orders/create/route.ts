import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getRazorpayInstance } from "@/lib/razorpay";
import { z } from "zod";

const createSchema = z.object({
  playbookSlug: z.string().min(1, "Playbook slug is required"),
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const { playbookSlug } = parsed.data;

  const playbook = await prisma.playbook.findUnique({
    where: { slug: playbookSlug },
  });

  if (!playbook) {
    return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
  }

  const existingPaid = await prisma.order.findFirst({
    where: { userId: session.user.id, playbookId: playbook.id, status: "paid" },
  });

  if (existingPaid) {
    return NextResponse.json({ error: "Already purchased" }, { status: 409 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      playbookId: playbook.id,
      amount: playbook.price,
      status: "pending",
    },
  });

  const amountPaise = playbook.price * 100;
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_...";

  try {
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order.id,
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      keyId,
      amount: amountPaise,
      currency: "INR",
      dbOrderId: order.id,
      playbook: {
        id: playbook.id,
        slug: playbook.slug,
        name: playbook.name,
        price: playbook.price,
      },
    });
  } catch {
    // Fall back to test-mode response when keys are invalid/missing.
    return NextResponse.json({
      orderId: `test_order_${order.id}`,
      keyId,
      amount: amountPaise,
      currency: "INR",
      dbOrderId: order.id,
      playbook: {
        id: playbook.id,
        slug: playbook.slug,
        name: playbook.name,
        price: playbook.price,
      },
    });
  }
}
