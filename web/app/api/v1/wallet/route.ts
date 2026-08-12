import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [creditAgg, debitAgg, transactions] = await Promise.all([
      prisma.walletTransaction.aggregate({
        where: { userId: session.user.id, type: "CREDIT" },
        _sum: { amount: true },
      }),
      prisma.walletTransaction.aggregate({
        where: { userId: session.user.id, type: "DEBIT" },
        _sum: { amount: true },
      }),
      prisma.walletTransaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    const totalCredit = creditAgg._sum.amount ?? 0;
    const totalDebit = debitAgg._sum.amount ?? 0;
    const balance = totalCredit - totalDebit;

    return NextResponse.json({
      balance,
      totalCredit,
      totalDebit,
      transactions,
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
