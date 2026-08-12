import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playbook = await prisma.playbook.findUnique({
    where: { slug: params.slug },
  });

  if (!playbook) {
    return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
  }

  const userId = session.user.id;

  if (session.user.isAdmin || playbook.price === 0 || playbook.category === "stream") {
    return NextResponse.json({ hasAccess: true });
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: "paid",
      OR: [{ playbookId: playbook.id }, { orderType: "PLAYBOOK", relatedId: playbook.id }],
    },
    orderBy: { createdAt: "desc" },
  });

  if (order) {
    return NextResponse.json({ hasAccess: true, order });
  }

  const pendingOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: "pending",
      OR: [{ playbookId: playbook.id }, { orderType: "PLAYBOOK", relatedId: playbook.id }],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ hasAccess: false, order: pendingOrder || undefined });
}
