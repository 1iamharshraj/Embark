import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const sectionVisibilitySchema = z.record(z.boolean()).optional();

const pageSettingsSchema = z.object({
  coverImage: z.string().optional(),
  accentColor: z.string().optional(),
  sectionOrder: z.array(z.string()).optional(),
  sectionVisibility: sectionVisibilitySchema,
});

type PageSettings = {
  accentColor?: string;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
};

function mergeSettings(existing: unknown | null, update: PageSettings): PageSettings {
  const current = (existing && typeof existing === "object" ? existing : {}) as PageSettings;
  return {
    ...current,
    ...update,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    select: { coverImage: true, pageSettings: true },
  });

  if (!profile) {
    return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
  }

  return NextResponse.json({ coverImage: profile.coverImage, pageSettings: profile.pageSettings });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, pageSettings: true },
  });
  if (!profile) {
    return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = pageSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updatePayload: {
      coverImage?: string | null;
      pageSettings?: Prisma.InputJsonValue;
    } = {};

    if (data.coverImage !== undefined) {
      updatePayload.coverImage = data.coverImage?.trim() || null;
    }

    const pageUpdate: PageSettings = {};
    if (data.accentColor !== undefined) pageUpdate.accentColor = data.accentColor.trim() || undefined;
    if (data.sectionOrder !== undefined) pageUpdate.sectionOrder = data.sectionOrder;
    if (data.sectionVisibility !== undefined) pageUpdate.sectionVisibility = data.sectionVisibility;

    if (Object.keys(pageUpdate).length > 0) {
      updatePayload.pageSettings = mergeSettings(profile.pageSettings, pageUpdate) as Prisma.InputJsonValue;
    }

    const updated = await prisma.expertProfile.update({
      where: { id: profile.id },
      data: updatePayload,
      select: { coverImage: true, pageSettings: true },
    });

    return NextResponse.json({ coverImage: updated.coverImage, pageSettings: updated.pageSettings });
  } catch (error) {
    console.error("Page settings update error:", error);
    return NextResponse.json({ message: "Failed to update page settings" }, { status: 500 });
  }
}
