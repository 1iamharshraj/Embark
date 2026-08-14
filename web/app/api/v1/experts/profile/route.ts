import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const commaList = z
  .union([z.array(z.string()), z.string()])
  .transform((val) => {
    if (Array.isArray(val)) return val;
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  })
  .default([]);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

function generateSlug(name: string | null | undefined): string {
  const base = slugify(name || "expert");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

const expertProfileSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  bio: z.string().min(1, "Bio is required"),
  location: z.string().optional(),
  bSchool: z.string().optional(),
  degree: z.string().optional(),
  specialization: z.string().optional(),
  graduationYear: z.coerce.number().min(1950).max(2050).optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  previousCompanies: commaList,
  yearsExperience: z.coerce.number().min(0).optional(),
  industry: z.string().optional(),
  function: z.string().optional(),
  expertise: commaList,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = expertProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.expertProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ message: "Expert profile already exists" }, { status: 409 });
    }

    const expertRole = await prisma.role.findUnique({
      where: { name: "Expert" },
    });

    const [profile] = await prisma.$transaction(async (tx) => {
      const profile = await tx.expertProfile.create({
        data: {
          userId: session.user.id,
          slug: generateSlug(session.user.name),
          headline: data.headline.trim(),
          bio: data.bio.trim(),
          location: data.location?.trim() || null,
          bSchool: data.bSchool?.trim() || null,
          degree: data.degree?.trim() || null,
          specialization: data.specialization?.trim() || null,
          graduationYear: data.graduationYear,
          currentCompany: data.currentCompany?.trim() || null,
          currentRole: data.currentRole?.trim() || null,
          previousCompanies: data.previousCompanies,
          yearsExperience: data.yearsExperience,
          industry: data.industry?.trim() || null,
          function: data.function?.trim() || null,
          expertise: data.expertise,
          verificationStatus: "UNVERIFIED",
          isPublic: false,
        },
      });

      if (expertRole) {
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId: session.user.id,
              roleId: expertRole.id,
            },
          },
          update: {},
          create: {
            userId: session.user.id,
            roleId: expertRole.id,
          },
        });
      }

      return [profile];
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Expert onboarding error:", error);
    return NextResponse.json({ message: "Failed to create expert profile" }, { status: 500 });
  }
}
