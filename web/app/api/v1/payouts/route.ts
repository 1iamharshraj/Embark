import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  amount: z.coerce.number().min(1),
  method: z.enum(["BANK", "UPI"]),
  accountDetails: z.record(z.string()).default({}),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const payouts = await prisma.payout.findMany({
      where: user.isAdmin ? {} : { userId: user.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ payouts });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}

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

    const { amount, method, accountDetails } = parsed.data;

    // Compute available balance
    const [credit, debit] = await Promise.all([
      prisma.walletTransaction.aggregate({
        where: { userId: session.user.id, type: "CREDIT" },
        _sum: { amount: true },
      }),
      prisma.walletTransaction.aggregate({
        where: { userId: session.user.id, type: "DEBIT" },
        _sum: { amount: true },
      }),
    ]);

    const balance = (credit._sum.amount ?? 0) - (debit._sum.amount ?? 0);
    if (amount > balance) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    const payout = await prisma.payout.create({
      data: {
        userId: session.user.id,
        amount,
        method,
        accountDetails,
        status: "PENDING",
      },
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (error) {
    console.error("Payout creation error:", error);
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 });
  }
}
