import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getRazorpayInstance } from "@/lib/razorpay";
import { z } from "zod";

const createSchema = z
  .object({
    type: z.enum(["playbook", "mentorship"]).default("playbook"),
    playbookSlug: z.string().optional(),
    bookingRequestId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "playbook") return !!data.playbookSlug;
      return !!data.bookingRequestId;
    },
    {
      message: "playbookSlug is required for playbook orders, bookingRequestId for mentorship orders",
      path: ["type"],
    }
  );

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

  const { type, playbookSlug, bookingRequestId } = parsed.data;

  let orderData: {
    userId: string;
    type: "playbook" | "mentorship";
    amount: number;
    playbookId?: string;
    bookingRequestId?: string;
  };

  let itemName: string;
  let itemSlug: string | undefined;

  if (type === "playbook") {
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

    orderData = {
      userId: session.user.id,
      type: "playbook",
      amount: playbook.price,
      playbookId: playbook.id,
    };
    itemName = playbook.name;
    itemSlug = playbook.slug;
  } else {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingRequestId },
      include: { mentor: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking request not found" }, { status: 404 });
    }
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Booking must be confirmed before payment" },
        { status: 400 }
      );
    }
    if (booking.amount == null || booking.amount <= 0) {
      return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 });
    }

    const existingPaid = await prisma.order.findFirst({
      where: { bookingRequestId: booking.id, status: "paid" },
    });
    if (existingPaid) {
      return NextResponse.json({ error: "Booking already paid" }, { status: 409 });
    }

    orderData = {
      userId: session.user.id,
      type: "mentorship",
      amount: booking.amount,
      bookingRequestId: booking.id,
    };
    itemName = booking.mentor.name;
    itemSlug = booking.mentor.slug;
  }

  const order = await prisma.order.create({
    data: {
      ...orderData,
      orderType: type === "playbook" ? "PLAYBOOK" : "MENTORSHIP",
      relatedId: type === "playbook" ? orderData.playbookId : orderData.bookingRequestId,
      status: "pending",
    },
  });

  const amountPaise = order.amount * 100;
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
      type,
      playbook:
        type === "playbook"
          ? { id: order.playbookId, slug: itemSlug, name: itemName, price: order.amount }
          : undefined,
    });
  } catch {
    return NextResponse.json({
      orderId: `test_order_${order.id}`,
      keyId,
      amount: amountPaise,
      currency: "INR",
      dbOrderId: order.id,
      type,
      playbook:
        type === "playbook"
          ? { id: order.playbookId, slug: itemSlug, name: itemName, price: order.amount }
          : undefined,
    });
  }
}
