import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
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

    const { name, phone, image, bio, location, linkedIn, website, isPublic } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: name.trim(),
          phone: phone?.trim() || null,
          image: image?.trim() || null,
        },
      });

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
        update: {
          bio: bio?.trim() || null,
          location: location?.trim() || null,
          linkedIn: linkedIn?.trim() || null,
          website: website?.trim() || null,
          isPublic: isPublic ?? true,
        },
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
