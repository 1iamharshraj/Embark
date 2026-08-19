import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().optional(),
  description: z.string().optional(),
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

  const experiences = await prisma.expertExperience.findMany({
    where: { expertProfileId: profile.id },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json({ experiences });
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
    const parsed = experienceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const experience = await prisma.expertExperience.create({
      data: {
        expertProfileId: profile.id,
        company: data.company.trim(),
        role: data.role?.trim() || null,
        description: data.description?.trim() || null,
        startYear: data.startYear,
        endYear: data.endYear,
        isCurrent: data.isCurrent ?? false,
        displayOrder: data.displayOrder,
      },
    });

    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    console.error("Experience create error:", error);
    return NextResponse.json({ message: "Failed to save experience" }, { status: 500 });
  }
}
