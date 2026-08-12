import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { createdAt: "desc" },
      include: {
        timelines: { orderBy: { startsAt: "asc" } },
        _count: { select: { registrations: true } },
      },
    });

    return NextResponse.json({ hackathons });
  } catch (error) {
    console.error("Fetch public hackathons error:", error);
    return NextResponse.json({ message: "Failed to fetch hackathons" }, { status: 500 });
  }
}
