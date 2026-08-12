import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ access: {} }, { status: 401 });
  }

  const userId = session.user.id;
  const isAdmin = session.user.isAdmin;

  const playbooks = await prisma.playbook.findMany({
    select: { slug: true, category: true, price: true, id: true },
  });

  const paidOrders = await prisma.order.findMany({
    where: {
      userId,
      status: "paid",
      OR: [{ playbookId: { not: null } }, { orderType: "PLAYBOOK", relatedId: { not: null } }],
    },
    select: { playbookId: true, relatedId: true, orderType: true },
  });

  const paidOrderIds = new Set(
    paidOrders.flatMap((o) => [o.playbookId, o.orderType === "PLAYBOOK" ? o.relatedId : null].filter(Boolean))
  );

  const access: Record<string, boolean> = {};
  for (const pb of playbooks) {
    access[pb.slug] =
      isAdmin ||
      pb.price === 0 ||
      pb.category === "stream" ||
      paidOrderIds.has(pb.id);
  }

  return NextResponse.json({ access });
}
