import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getDefaultCommissionRate } from "@/lib/commission";
import { z } from "zod";

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

const updateSchema = z.object({
  settings: z.record(z.string().nullable()),
});

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "settings.view");

    const configs = await prisma.platformConfig.findMany({ orderBy: { key: "asc" } });
    const hasRate = configs.some((c) => c.key === "defaultCommissionRate");
    const settings = hasRate
      ? configs
      : [
          ...configs,
          {
            id: "defaultCommissionRate",
            key: "defaultCommissionRate",
            value: String(await getDefaultCommissionRate()),
            defaultCommissionRate: 0.2,
            currency: "INR",
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        ];
    return NextResponse.json({ settings });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Admin settings GET error:", error);
    return NextResponse.json({ message: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "settings.update");

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { settings } = parsed.data;
    const keys = Object.keys(settings);

    const previous = await prisma.platformConfig.findMany({
      where: { key: { in: keys } },
    });

    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        await tx.platformConfig.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      }
    });

    const updated = await prisma.platformConfig.findMany({
      where: { key: { in: keys } },
    });

    await createAuditLog({
      userId: user.id,
      action: "settings.update",
      resource: "platformConfig",
      oldValue: { settings: Object.fromEntries(previous.map((c) => [c.key, c.value])) },
      newValue: { settings: Object.fromEntries(updated.map((c) => [c.key, c.value])) },
    });

    return NextResponse.json({ settings: updated });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Admin settings PUT error:", error);
    return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
