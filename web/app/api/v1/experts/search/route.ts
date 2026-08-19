import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const bSchool = searchParams.get("bSchool")?.trim() || "";
    const graduationYear = Number(searchParams.get("graduationYear")) || 0;
    const company = searchParams.get("company")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";
    const functionField = searchParams.get("function")?.trim() || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    const minRating = Number(searchParams.get("minRating")) || 0;
    const availability = searchParams.get("availability");
    const verified = searchParams.get("verified") !== "false"; // default true
    const sort = searchParams.get("sort") || "rating";
    const studentCollege = searchParams.get("studentCollege")?.trim() || "";
    const studentIndustry = searchParams.get("studentIndustry")?.trim() || "";
    const studentRole = searchParams.get("studentRole")?.trim() || "";
    const studentGoals = searchParams.get("studentGoals")?.trim() || "";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));

    const where: Record<string, unknown> = {
      isPublic: true,
    };

    if (verified) {
      where.verificationStatus = "VERIFIED";
    }

    if (q) {
      const terms = q.split(/\s+/).filter(Boolean);
      where.OR = terms.flatMap((term: string) => [
        { user: { name: { contains: term, mode: "insensitive" } } },
        { headline: { contains: term, mode: "insensitive" } },
        { bio: { contains: term, mode: "insensitive" } },
        { bSchool: { contains: term, mode: "insensitive" } },
        { currentCompany: { contains: term, mode: "insensitive" } },
        { currentRole: { contains: term, mode: "insensitive" } },
        { industry: { contains: term, mode: "insensitive" } },
        { function: { contains: term, mode: "insensitive" } },
        { expertise: { has: term } },
        { previousCompanies: { hasSome: [term] } },
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

    if (bSchool) {
      where.bSchool = { contains: bSchool, mode: "insensitive" };
    }

    if (graduationYear > 0) {
      where.graduationYear = graduationYear;
    }

    if (company) {
      where.OR = where.OR ?? [];
      (where.OR as unknown[]).push(
        { currentCompany: { contains: company, mode: "insensitive" } },
        { previousCompanies: { hasSome: [company] } }
      );
    }

    if (industry) {
      where.industry = { contains: industry, mode: "insensitive" };
    }

    if (functionField) {
      where.function = { contains: functionField, mode: "insensitive" };
    }

    if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
      const existingServices = where.services as object | undefined;
      where.services = {
        ...existingServices,
        some: {
          isActive: true,
          price: { gte: minPrice * 100, lte: maxPrice * 100 },
        },
      };
    }

    if (minRating > 0) {
      where.rating = { gte: minRating };
    }

    if (availability === "true") {
      where.isAvailable = true;
    }

    const [experts, total] = await Promise.all([
      prisma.expertProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
          services: { where: { isActive: true }, orderBy: { price: "asc" } },
          packages: { where: { isActive: true }, orderBy: { price: "asc" } },
        },
        orderBy: { rating: "desc" },
      }),
      prisma.expertProfile.count({ where }),
    ]);

    const goalTerms = studentGoals
      .split(/[,\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const sortedExperts = experts
      .map((expert) => {
        let score = 0;

        if (sort === "recommended") {
          score += (expert.rating || 0) * 10;
          score += (expert.reviewCount || 0) * 2;
          score += (expert.sessionsCompleted || 0) * 0.5;

          if (studentCollege && expert.bSchool?.toLowerCase().includes(studentCollege.toLowerCase())) {
            score += 40;
          }
          if (studentIndustry && expert.industry?.toLowerCase().includes(studentIndustry.toLowerCase())) {
            score += 30;
          }
          if (studentRole && expert.currentRole?.toLowerCase().includes(studentRole.toLowerCase())) {
            score += 25;
          }
          if (studentRole && expert.function?.toLowerCase().includes(studentRole.toLowerCase())) {
            score += 20;
          }
          if (goalTerms.length > 0) {
            const expertTerms = [...expert.expertise, expert.industry || "", expert.function || ""]
              .join(" ")
              .toLowerCase();
            for (const term of goalTerms) {
              if (expertTerms.includes(term)) score += 15;
            }
          }
        }

        return { expert, score };
      })
      .sort((a, b) => {
        if (sort === "recommended") return b.score - a.score;
        if (sort === "price_asc") {
          const pa = a.expert.services[0]?.price ?? Number.MAX_SAFE_INTEGER;
          const pb = b.expert.services[0]?.price ?? Number.MAX_SAFE_INTEGER;
          return pa - pb;
        }
        if (sort === "price_desc") {
          const pa = a.expert.services[0]?.price ?? 0;
          const pb = b.expert.services[0]?.price ?? 0;
          return pb - pa;
        }
        return b.expert.rating - a.expert.rating;
      });

    const paginated = sortedExperts.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      experts: paginated.map(({ expert }) => ({
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
