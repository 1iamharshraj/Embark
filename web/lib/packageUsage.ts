import { PrismaClient } from "@prisma/client";

export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface PackageRedemptionResult {
  purchaseId: string;
  remaining: number;
}

export async function findActivePackageItem(
  tx: PrismaTransaction,
  studentId: string,
  serviceId: string,
  expertProfileId: string
) {
  const purchase = await tx.packagePurchase.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
      validUntil: { gt: new Date() },
      package: {
        expertProfileId,
        isActive: true,
        items: { some: { serviceId } },
      },
    },
    include: {
      package: {
        include: { items: { include: { service: { select: { id: true, type: true } } } } },
      },
    },
    orderBy: { validUntil: "asc" },
  });

  if (!purchase) return null;

  const item = purchase.package.items.find((i) => i.serviceId === serviceId);
  if (!item) return null;

  const used = await tx.packageUsage.aggregate({
    where: {
      purchaseId: purchase.id,
      serviceType: item.service.type,
    },
    _sum: { quantityUsed: true },
  });

  const usedCount = used._sum.quantityUsed ?? 0;
  if (usedCount >= item.quantity) return null;

  return { purchase, item, usedCount };
}

export async function consumePackageForBooking(
  tx: PrismaTransaction,
  studentId: string,
  serviceId: string,
  expertProfileId: string,
  bookingId: string
): Promise<PackageRedemptionResult | null> {
  const match = await findActivePackageItem(tx, studentId, serviceId, expertProfileId);
  if (!match) return null;

  const { purchase, item } = match;

  await tx.packageUsage.create({
    data: {
      purchaseId: purchase.id,
      serviceType: item.service.type,
      relatedBookingId: bookingId,
      quantityUsed: 1,
    },
  });

  await updatePurchaseStatus(tx, purchase.id);

  return { purchaseId: purchase.id, remaining: match.item.quantity - match.usedCount - 1 };
}

export async function consumePackageForDM(
  tx: PrismaTransaction,
  studentId: string,
  serviceId: string,
  expertProfileId: string,
  dmId: string
): Promise<PackageRedemptionResult | null> {
  const match = await findActivePackageItem(tx, studentId, serviceId, expertProfileId);
  if (!match) return null;

  const { purchase, item } = match;

  await tx.packageUsage.create({
    data: {
      purchaseId: purchase.id,
      serviceType: item.service.type,
      relatedDmId: dmId,
      quantityUsed: 1,
    },
  });

  await updatePurchaseStatus(tx, purchase.id);

  return { purchaseId: purchase.id, remaining: match.item.quantity - match.usedCount - 1 };
}

async function updatePurchaseStatus(tx: PrismaTransaction, purchaseId: string) {
  const purchase = await tx.packagePurchase.findUnique({
    where: { id: purchaseId },
    include: {
      package: { include: { items: { include: { service: { select: { type: true } } } } } },
      usages: true,
    },
  });

  if (!purchase) return;

  const now = new Date();
  if (purchase.validUntil <= now) {
    await tx.packagePurchase.update({ where: { id: purchaseId }, data: { status: "EXPIRED" } });
    return;
  }

  const allUsed = purchase.package.items.every((item) => {
    const used = purchase.usages
      .filter((u) => u.serviceType === item.service.type)
      .reduce((sum, u) => sum + u.quantityUsed, 0);
    return used >= item.quantity;
  });

  if (allUsed && purchase.package.items.length > 0) {
    await tx.packagePurchase.update({ where: { id: purchaseId }, data: { status: "COMPLETED" } });
  } else if (purchase.usages.length > 0) {
    await tx.packagePurchase.update({ where: { id: purchaseId }, data: { status: "PARTIALLY_USED" } });
  }
}
