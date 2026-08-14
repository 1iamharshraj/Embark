import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const specialization = searchParams.get("specialization")?.trim() || "";
    const accreditation = searchParams.get("accreditation")?.trim() || "";
    const entranceExam = searchParams.get("entranceExam")?.trim() || "";
    const maxFees = searchParams.get("maxFees") ? Number(searchParams.get("maxFees")) : null;

    const where: {
      isActive: boolean;
      state: string;
      OR?: { name?: { contains: string; mode: "insensitive" }; shortName?: { contains: string; mode: "insensitive" }; city?: { contains: string; mode: "insensitive" } }[];
      city?: { equals: string; mode: "insensitive" };
      accreditation?: { contains: string; mode: "insensitive" };
      specializations?: { has: string };
      entranceExams?: { has: string };
      feesMax?: { lte: number };
    } = {
      isActive: true,
      state: "Tamil Nadu",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) where.city = { equals: city, mode: "insensitive" };
    if (accreditation) where.accreditation = { contains: accreditation, mode: "insensitive" };
    if (specialization) where.specializations = { has: specialization };
    if (entranceExam) where.entranceExams = { has: entranceExam };
    if (maxFees && !isNaN(maxFees)) where.feesMax = { lte: maxFees };

    const [colleges, allColleges] = await Promise.all([
      prisma.mbaCollege.findMany({
        where,
        orderBy: [{ rankState: "asc" }, { name: "asc" }],
      }),
      prisma.mbaCollege.findMany({
        where: { isActive: true, state: "Tamil Nadu" },
        select: { city: true, specializations: true, accreditation: true, entranceExams: true },
      }),
    ]);

    const cities = Array.from(new Set(allColleges.map((c) => c.city))).sort();
    const specializations = Array.from(new Set(allColleges.flatMap((c) => c.specializations))).sort();
    const accreditations = Array.from(new Set(allColleges.map((c) => c.accreditation).filter(Boolean) as string[])).sort();
    const entranceExams = Array.from(new Set(allColleges.flatMap((c) => c.entranceExams))).sort();

    return NextResponse.json({
      colleges,
      filters: { cities, specializations, accreditations, entranceExams },
    });
  } catch (error) {
    console.error("MBA colleges API error:", error);
    return NextResponse.json({ error: "Failed to load colleges" }, { status: 500 });
  }
}
