import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getRazorpayInstance } from "@/lib/razorpay";

const createSchema = z.object({
  orderType: z.enum(["PLAYBOOK", "MENTORSHIP", "BOOKING", "PRIORITY_DM", "PACKAGE", "HACKATHON_FEE"]),
  relatedId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { orderType, relatedId } = parsed.data;
    const userId = session.user.id;

    const { amount, itemName } = await resolveOrderTarget(orderType, relatedId, userId);

    // Prevent duplicate paid orders for the same target
    const existingPaid = await prisma.order.findFirst({
      where: {
        userId,
        orderType,
        relatedId,
        status: "paid",
      },
    });
    if (existingPaid) {
      return NextResponse.json({ error: "Already paid" }, { status: 409 });
    }

    const orderData: {
      userId: string;
      type: string;
      orderType: string;
      relatedId: string;
      amount: number;
      status: string;
      playbookId?: string;
      bookingRequestId?: string;
    } = {
      userId,
      type: orderType.toLowerCase(),
      orderType,
      relatedId,
      amount,
      status: "pending",
    };

    if (orderType === "PLAYBOOK") orderData.playbookId = relatedId;
    if (orderType === "MENTORSHIP") orderData.bookingRequestId = relatedId;

    const order = await prisma.order.create({ data: orderData });

    // Track checkout start for analytics
    const checkoutExpertId = await resolveExpertIdForOrder(orderType, relatedId);
    if (checkoutExpertId) {
      prisma.analyticsEvent
        .create({
          data: {
            event: "CHECKOUT_START",
            expertId: checkoutExpertId,
            userId,
            metadata: { orderType, relatedId, orderId: order.id },
          },
        })
        .catch(() => {});
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_...";
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const isMockMode = !keyId || !secret || secret === "..." || secret.startsWith("test_secret_") || secret.includes("placeholder");
    const amountPaise = order.amount;

    if (isMockMode) {
      const testOrderId = `test_order_${order.id}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: testOrderId },
      });

      return NextResponse.json({
        orderId: testOrderId,
        keyId,
        amount: amountPaise,
        currency: "INR",
        dbOrderId: order.id,
        orderType,
        relatedId,
        name: itemName,
        mock: true,
      });
    }

    try {
      const razorpay = getRazorpayInstance();
      const razorpayOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: order.id,
        notes: {
          orderType,
          relatedId,
          dbOrderId: order.id,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });

      return NextResponse.json({
        orderId: razorpayOrder.id,
        keyId,
        amount: amountPaise,
        currency: "INR",
        dbOrderId: order.id,
        orderType,
        relatedId,
        name: itemName,
      });
    } catch {
      // Fallback for test environments without real keys
      const testOrderId = `test_order_${order.id}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: testOrderId },
      });

      return NextResponse.json({
        orderId: testOrderId,
        keyId,
        amount: amountPaise,
        currency: "INR",
        dbOrderId: order.id,
        orderType,
        relatedId,
        name: itemName,
        mock: true,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

async function resolveOrderTarget(orderType: string, relatedId: string, userId: string) {
  switch (orderType) {
    case "PLAYBOOK": {
      const playbook = await prisma.playbook.findUnique({ where: { id: relatedId } });
      if (!playbook) throw new Error("Playbook not found");
      return { amount: playbook.price * 100, itemName: playbook.name };
    }
    case "MENTORSHIP": {
      const bookingRequest = await prisma.bookingRequest.findUnique({
        where: { id: relatedId },
        include: { mentor: true },
      });
      if (!bookingRequest) throw new Error("Booking request not found");
      if (bookingRequest.userId !== userId) throw new Error("Forbidden");
      if (bookingRequest.status !== "confirmed") throw new Error("Booking must be confirmed before payment");
      if (!bookingRequest.amount || bookingRequest.amount <= 0) throw new Error("Invalid booking amount");
      return { amount: bookingRequest.amount * 100, itemName: `Mentorship with ${bookingRequest.mentor.name}` };
    }
    case "BOOKING": {
      const booking = await prisma.booking.findUnique({
        where: { id: relatedId },
        include: { service: true },
      });
      if (!booking) throw new Error("Booking not found");
      if (booking.clientId !== userId) throw new Error("Forbidden");
      if (booking.status !== "PENDING_PAYMENT") throw new Error("Booking is not awaiting payment");
      return { amount: booking.amount, itemName: booking.service.name };
    }
    case "PRIORITY_DM": {
      const dm = await prisma.priorityDM.findUnique({ where: { id: relatedId } });
      if (!dm) throw new Error("Priority DM not found");
      if (dm.studentId !== userId) throw new Error("Forbidden");
      if (dm.status !== "PENDING_PAYMENT") throw new Error("Priority DM is not awaiting payment");
      return { amount: dm.amount, itemName: dm.title };
    }
    case "PACKAGE": {
      const pkg = await prisma.package.findUnique({ where: { id: relatedId } });
      if (!pkg) throw new Error("Package not found");
      if (!pkg.isActive) throw new Error("Package is not active");
      return { amount: pkg.price, itemName: pkg.name };
    }
    case "HACKATHON_FEE": {
      const registration = await prisma.hackathonRegistration.findUnique({
        where: { id: relatedId },
        include: { hackathon: true },
      });
      if (!registration) throw new Error("Registration not found");
      if (registration.userId !== userId) throw new Error("Forbidden");
      return { amount: registration.hackathon.fee, itemName: registration.hackathon.title };
    }
    default:
      throw new Error("Unsupported order type");
  }
}

async function resolveExpertIdForOrder(orderType: string, relatedId: string): Promise<string | null> {
  try {
    switch (orderType) {
      case "BOOKING": {
        const booking = await prisma.booking.findUnique({
          where: { id: relatedId },
          select: { expertId: true },
        });
        return booking?.expertId || null;
      }
      case "PRIORITY_DM": {
        const dm = await prisma.priorityDM.findUnique({
          where: { id: relatedId },
          select: { expertId: true },
        });
        return dm?.expertId || null;
      }
      case "PACKAGE": {
        const pkg = await prisma.package.findUnique({
          where: { id: relatedId },
          select: { expertProfile: { select: { userId: true } } },
        });
        return pkg?.expertProfile?.userId || null;
      }
      case "MENTORSHIP": {
        // Mentors are legacy; no expert user mapping here
        return null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}
