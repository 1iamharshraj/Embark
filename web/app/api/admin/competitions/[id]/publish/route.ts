import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const competition = await prisma.competition.findUnique({ where: { id: params.id } });
  if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.competition.update({
    where: { id: params.id },
    data: { draft: false },
  });

  return NextResponse.json({ competition: updated });
}
