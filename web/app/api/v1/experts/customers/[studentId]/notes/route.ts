import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty").max(5000, "Note is too long"),
});

async function getAuthorizedExpert(sessionUserId: string, studentId: string) {
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { isAdmin: true },
  });

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: sessionUserId },
  });

  // Verify the student has interacted with this expert (or admin override)
  const hasRelationship = user?.isAdmin
    ? true
    : !!(await prisma.booking.findFirst({
        where: { expertId: sessionUserId, clientId: studentId },
      })) ||
      !!(await prisma.priorityDM.findFirst({
        where: { expertId: sessionUserId, studentId },
      })) ||
      !!(await prisma.packagePurchase.findFirst({
        where: { studentId, package: { expertProfileId: expertProfile?.id } },
      }));

  if (!user?.isAdmin && !expertProfile) return null;
  if (!hasRelationship) return null;

  return { user, expertProfile };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentId } = await params;
    const auth = await getAuthorizedExpert(session.user.id, studentId);
    if (!auth) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const note = auth.expertProfile
      ? await prisma.customerNote.findUnique({
          where: {
            expertProfileId_studentId: {
              expertProfileId: auth.expertProfile.id,
              studentId,
            },
          },
        })
      : null;

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Fetch customer note error:", error);
    return NextResponse.json({ message: "Failed to fetch note" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentId } = await params;
    const auth = await getAuthorizedExpert(session.user.id, studentId);
    if (!auth?.expertProfile) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const note = await prisma.customerNote.upsert({
      where: {
        expertProfileId_studentId: {
          expertProfileId: auth.expertProfile.id,
          studentId,
        },
      },
      update: { content: parsed.data.content.trim() },
      create: {
        expertProfileId: auth.expertProfile.id,
        studentId,
        content: parsed.data.content.trim(),
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Save customer note error:", error);
    return NextResponse.json({ message: "Failed to save note" }, { status: 500 });
  }
}
