import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const expert = await prisma.expertProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!expert || (!expert.isPublic && expert.verificationStatus !== "VERIFIED")) {
      return NextResponse.json({ message: "Expert not found" }, { status: 404 });
    }

    return NextResponse.json({
      expert: {
        id: expert.id,
        userId: expert.userId,
        name: expert.user.name,
        image: expert.user.image,
        headline: expert.headline,
        bio: expert.bio,
        location: expert.location,
        bSchool: expert.bSchool,
        degree: expert.degree,
        specialization: expert.specialization,
        graduationYear: expert.graduationYear,
        currentCompany: expert.currentCompany,
        currentRole: expert.currentRole,
        previousCompanies: expert.previousCompanies,
        yearsExperience: expert.yearsExperience,
        industry: expert.industry,
        function: expert.function,
        expertise: expert.expertise,
        verificationStatus: expert.verificationStatus,
        rating: expert.rating,
        reviewCount: expert.reviewCount,
        sessionsCompleted: expert.sessionsCompleted,
        studentsHelped: expert.studentsHelped,
      },
    });
  } catch (error) {
    console.error("Expert fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch expert" }, { status: 500 });
  }
}
