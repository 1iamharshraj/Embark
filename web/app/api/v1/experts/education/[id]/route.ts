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

async function ownsEducation(userId: string, id: string) {
  const profile = await prisma.expertProfile.findUnique({ where: { userId } });
  if (!profile) return null;
  const education = await prisma.expertEducation.findFirst({
    where: { id, expertProfileId: profile.id },
  });
  return education;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await ownsEducation(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
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
    const education = await prisma.expertEducation.update({
      where: { id: params.id },
      data: {
        institution: data.institution.trim(),
        degree: data.degree?.trim() || null,
        specialization: data.specialization?.trim() || null,
        startYear: data.startYear,
        endYear: data.endYear,
        isCurrent: data.isCurrent ?? false,
        displayOrder: data.displayOrder,
      },
    });

    return NextResponse.json({ education });
  } catch (error) {
    console.error("Education update error:", error);
    return NextResponse.json({ message: "Failed to update education" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await ownsEducation(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await prisma.expertEducation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
