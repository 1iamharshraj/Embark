import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const registrations = await prisma.registration.findMany({
    where: { compId: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, college: true } },
      submissions: { orderBy: { roundIdx: "asc" } },
      advancements: true,
      winner: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ registrations });
}
