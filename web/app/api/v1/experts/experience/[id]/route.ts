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

async function ownsExperience(userId: string, id: string) {
  const profile = await prisma.expertProfile.findUnique({ where: { userId } });
  if (!profile) return null;
  const experience = await prisma.expertExperience.findFirst({
    where: { id, expertProfileId: profile.id },
  });
  return experience;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await ownsExperience(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
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
    const experience = await prisma.expertExperience.update({
      where: { id: params.id },
      data: {
        company: data.company.trim(),
        role: data.role?.trim() || null,
        description: data.description?.trim() || null,
        startYear: data.startYear,
        endYear: data.endYear,
        isCurrent: data.isCurrent ?? false,
        displayOrder: data.displayOrder,
      },
    });

    return NextResponse.json({ experience });
  } catch (error) {
    console.error("Experience update error:", error);
    return NextResponse.json({ message: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await ownsExperience(session.user.id, params.id);
  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await prisma.expertExperience.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
