import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

export async function unlockAfterPayment(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  orderType: string,
  relatedId: string | null | undefined,
  order: { id: string; userId: string },
  platformAmount: number,
  expertAmount: number
) {
  if (!relatedId) return;

  switch (orderType) {
    case "BOOKING": {
      await tx.booking.update({
        where: { id: relatedId },
        data: {
          status: "CONFIRMED",
          platformFee: platformAmount,
          expertEarnings: expertAmount,
        },
      });
      break;
    }
    case "PRIORITY_DM": {
      await tx.priorityDM.update({
        where: { id: relatedId },
        data: {
          status: "PAID",
          platformFee: platformAmount,
          expertEarnings: expertAmount,
        },
      });
      break;
    }
    case "PACKAGE": {
      const pkg = await tx.package.findUnique({
        where: { id: relatedId },
        select: { id: true, price: true, validityDays: true },
      });
      if (pkg) {
        const existing = await tx.packagePurchase.findFirst({
          where: { packageId: pkg.id, studentId: order.userId },
          orderBy: { createdAt: "desc" },
        });
        if (existing) {
          await tx.packagePurchase.update({
            where: { id: existing.id },
            data: {
              status: "ACTIVE",
              validUntil: addDays(new Date(), pkg.validityDays),
              amount: pkg.price,
              platformFee: platformAmount,
              expertEarnings: expertAmount,
              orderId: order.id,
            },
          });
        } else {
          await tx.packagePurchase.create({
            data: {
              packageId: pkg.id,
              studentId: order.userId,
              orderId: order.id,
              status: "ACTIVE",
              validUntil: addDays(new Date(), pkg.validityDays),
              amount: pkg.price,
              platformFee: platformAmount,
              expertEarnings: expertAmount,
            },
          });
        }
      }
      break;
    }
    case "MENTORSHIP": {
      await tx.bookingRequest.update({
        where: { id: relatedId },
        data: { status: "paid" },
      });
      break;
    }
    case "PLAYBOOK":
    case "HACKATHON_FEE":
    default:
      // Playbook access is checked via paid Order; hackathon fee is handled elsewhere.
      break;
  }
}
