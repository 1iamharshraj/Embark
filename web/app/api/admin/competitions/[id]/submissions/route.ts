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

  const submissions = await prisma.submission.findMany({
    where: { compId: params.id },
    include: {
      registration: { select: { teamName: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { roundIdx: "asc" },
  });

  const withLinks = submissions.map((s) => ({
    ...s,
    downloadUrl: s.filePath ? `/api/submissions/${s.id}/download` : null,
  }));

  return NextResponse.json({ submissions: withLinks });
}
