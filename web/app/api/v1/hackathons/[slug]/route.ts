import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { slug: params.slug },
      include: {
        timelines: { orderBy: { startsAt: "asc" } },
        _count: { select: { registrations: true, teams: true, submissions: true } },
      },
    });

    if (!hackathon) {
      return NextResponse.json({ message: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({ hackathon });
  } catch (error) {
    console.error("Fetch hackathon error:", error);
    return NextResponse.json({ message: "Failed to fetch hackathon" }, { status: 500 });
  }
}
