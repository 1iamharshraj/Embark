import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const studentProfileSchema = z.object({
  college: z.string().min(1, "College is required"),
  degree: z.string().optional(),
  specialization: z.string().optional(),
  graduationYear: z.number().min(1950).max(2050).optional(),
  currentSemester: z.string().optional(),
  targetIndustry: z.string().optional(),
  targetRoles: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  resumeUrl: z.string().optional(),
  portfolio: z.string().optional(),
  bio: z.string().optional(),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = studentProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: {
        ...data,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { college: data.college.trim() },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Student profile update error:", error);
    return NextResponse.json({ message: "Failed to update student profile" }, { status: 500 });
  }
}
