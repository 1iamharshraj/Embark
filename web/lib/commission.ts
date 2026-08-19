import { prisma } from "@/lib/prisma";

export async function getDefaultCommissionRate(): Promise<number> {
  const [rateConfig, legacyConfig] = await Promise.all([
    prisma.platformConfig.findUnique({ where: { key: "defaultCommissionRate" } }),
    prisma.platformConfig.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  if (rateConfig?.value) {
    const parsed = parseFloat(rateConfig.value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return legacyConfig?.defaultCommissionRate ?? 0.2;
}

export function calculateCommission(amount: number, rate: number) {
  const platformAmount = Math.round(amount * rate);
  const expertAmount = amount - platformAmount;
  return { platformAmount, expertAmount, rate };
}
