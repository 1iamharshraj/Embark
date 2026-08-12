import { prisma } from "@/lib/prisma";

export async function getDefaultCommissionRate(): Promise<number> {
  const config = await prisma.platformConfig.findFirst({
    orderBy: { createdAt: "asc" },
  });
  return config?.defaultCommissionRate ?? 0.2;
}

export function calculateCommission(amount: number, rate: number) {
  const platformAmount = Math.round(amount * rate);
  const expertAmount = amount - platformAmount;
  return { platformAmount, expertAmount, rate };
}
