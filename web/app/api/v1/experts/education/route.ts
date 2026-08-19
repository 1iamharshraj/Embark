import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().optional(),
  specialization: z.string().optional(),
  startYear: z.coerce.number().min(1950).max(2050).optional(),
  endYear: z.coerce.number().min(1950).max(2050).optional(),
  isCurrent: z.boolean().optional(),
  displayOrder: z.coerce.number().default(0),
});

async function getExpertProfile(userId: string) {
  return prisma.expertProfile.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await getExpertProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
  }

  const educations = await prisma.expertEducation.findMany({
    where: { expertProfileId: profile.id },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json({ educations });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await getExpertProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = educationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const education = await prisma.expertEducation.create({
      data: {
        expertProfileId: profile.id,
        institution: data.institution.trim(),
        degree: data.degree?.trim() || null,
        specialization: data.specialization?.trim() || null,
        startYear: data.startYear,
        endYear: data.endYear,
        isCurrent: data.isCurrent ?? false,
        displayOrder: data.displayOrder,
      },
    });

    return NextResponse.json({ education }, { status: 201 });
  } catch (error) {
    console.error("Education create error:", error);
    return NextResponse.json({ message: "Failed to save education" }, { status: 500 });
  }
}
