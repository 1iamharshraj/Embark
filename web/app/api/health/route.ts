import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: "error", db: "disconnected", error: String(error) },
      { status: 503 }
    );
  }
}
