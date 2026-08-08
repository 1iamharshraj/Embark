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

  const [mentorship, speakers, lectures] = await Promise.all([
    prisma.bookingRequest.count({ where: { status: "pending" } }),
    prisma.speakerApplication.count({ where: { status: "pending" } }),
    prisma.lectureRequest.count({ where: { status: "pending" } }),
  ]);

  return NextResponse.json({
    counts: { mentorship, speakers, lectures, total: mentorship + speakers + lectures },
  });
}
