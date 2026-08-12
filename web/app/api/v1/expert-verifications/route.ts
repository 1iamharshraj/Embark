import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const verificationSchema = z.object({
  educationProof: z.string().optional(),
  employmentProof: z.string().optional(),
  linkedInUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  supportingDocs: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = verificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!expertProfile) {
      return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
    }

    const pending = await prisma.expertVerification.findFirst({
      where: { expertProfileId: expertProfile.id, status: "PENDING_VERIFICATION" },
    });

    if (pending) {
      return NextResponse.json(
        { message: "A verification request is already pending" },
        { status: 409 }
      );
    }

    const verification = await prisma.expertVerification.create({
      data: {
        expertProfileId: expertProfile.id,
        status: "PENDING_VERIFICATION",
        educationProof: data.educationProof?.trim() || null,
        employmentProof: data.employmentProof?.trim() || null,
        linkedInUrl: data.linkedInUrl?.trim() || null,
        resumeUrl: data.resumeUrl?.trim() || null,
        supportingDocs: data.supportingDocs,
      },
    });

    await prisma.expertProfile.update({
      where: { id: expertProfile.id },
      data: { verificationStatus: "PENDING_VERIFICATION" },
    });

    return NextResponse.json({ verification }, { status: 201 });
  } catch (error) {
    console.error("Verification submission error:", error);
    return NextResponse.json({ message: "Failed to submit verification" }, { status: 500 });
  }
}
