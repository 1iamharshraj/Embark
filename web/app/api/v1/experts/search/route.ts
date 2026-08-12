import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      verificationStatus: "VERIFIED",
      isPublic: true,
    };

    if (q) {
      const terms = q.split(/\s+/).filter(Boolean);
      where.OR = terms.flatMap((term: string) => [
        { user: { name: { contains: term, mode: "insensitive" } } },
        { headline: { contains: term, mode: "insensitive" } },
        { bio: { contains: term, mode: "insensitive" } },
        { expertise: { has: term } },
      ]);
    }

    if (category) {
      where.services = {
        some: {
          isActive: true,
          category: { contains: category, mode: "insensitive" },
        },
      };
    }

    if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
      where.services = {
        ...(where.services as object),
        some: {
          isActive: true,
          price: { gte: minPrice * 100, lte: maxPrice * 100 },
        },
      };
    }

    const [experts, total] = await Promise.all([
      prisma.expertProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          services: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
          packages: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
        },
        orderBy: { rating: "desc" },
        skip,
        take: limit,
      }),
      prisma.expertProfile.count({ where }),
    ]);

    return NextResponse.json({
      experts: experts.map((expert) => ({
        ...expert,
        services: expert.services.map((s) => ({
          ...s,
          priceDisplay: (s.price / 100).toFixed(2),
        })),
        packages: expert.packages.map((p) => ({
          ...p,
          priceDisplay: (p.price / 100).toFixed(2),
        })),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Expert search error:", error);
    return NextResponse.json({ message: "Failed to search experts" }, { status: 500 });
  }
}
