import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, AuthorizedUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  defaultCommissionRate: z.coerce.number().min(0).max(1),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionUser = session.user as AuthorizedUser;
    try {
      requirePermission(sessionUser, "commission.view");
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let config = await prisma.platformConfig.findFirst({ orderBy: { createdAt: "asc" } });
    if (!config) {
      config = await prisma.platformConfig.create({ data: { key: "default" } });
    }

    const commissions = await prisma.commission.findMany({
      include: {
        order: { select: { id: true, orderType: true, amount: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ config, commissions });
  } catch (error) {
    console.error("Commission fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch commissions" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionUser = session.user as AuthorizedUser;
    try {
      requirePermission(sessionUser, "commission.update");
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    let config = await prisma.platformConfig.findFirst({ orderBy: { createdAt: "asc" } });
    if (!config) {
      config = await prisma.platformConfig.create({ data: { key: "default", defaultCommissionRate: parsed.data.defaultCommissionRate } });
    } else {
      config = await prisma.platformConfig.update({
        where: { id: config.id },
        data: { defaultCommissionRate: parsed.data.defaultCommissionRate },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Commission update error:", error);
    return NextResponse.json({ error: "Failed to update commission config" }, { status: 500 });
  }
}
