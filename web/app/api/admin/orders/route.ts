import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true, name: true } }, playbook: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
