import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const tokens = await prisma.passwordResetToken.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tokens }, { status: 200 });
}
