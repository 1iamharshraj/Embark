import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  college: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, college, phone, image, bio, location, linkedIn, website, isPublic } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const userData: { name?: string; college?: string; phone?: string | null; image?: string | null } = {};
      if (name !== undefined) userData.name = name.trim();
      if (college !== undefined) userData.college = college.trim();
      if (phone !== undefined) userData.phone = phone?.trim() || null;
      if (image !== undefined) userData.image = image?.trim() || null;

      const user = await tx.user.update({
        where: { id: session.user.id },
        data: userData,
      });

      const profileData: {
        bio?: string | null;
        location?: string | null;
        linkedIn?: string | null;
        website?: string | null;
        isPublic?: boolean;
      } = {};
      if (bio !== undefined) profileData.bio = bio?.trim() || null;
      if (location !== undefined) profileData.location = location?.trim() || null;
      if (linkedIn !== undefined) profileData.linkedIn = linkedIn?.trim() || null;
      if (website !== undefined) profileData.website = website?.trim() || null;
      if (isPublic !== undefined) profileData.isPublic = isPublic;

      await tx.studentProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          bio: bio?.trim() || null,
          location: location?.trim() || null,
          linkedIn: linkedIn?.trim() || null,
          website: website?.trim() || null,
          isPublic: isPublic ?? true,
        },
        update: profileData,
      });

      return user;
    });

    return NextResponse.json(
      {
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          phone: updated.phone,
          image: updated.image,
          isAdmin: updated.isAdmin,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
