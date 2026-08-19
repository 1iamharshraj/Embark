import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission, AuthorizedUser } from "@/lib/rbac";
import { findActivePackageItem, consumePackageForDM } from "@/lib/packageUsage";

const createSchema = z.object({
  expertId: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  question: z.string().min(1, "Question is required"),
  context: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "priority_dm.view");

    const dms = await prisma.priorityDM.findMany({
      where: user.isAdmin
        ? {}
        : {
            OR: [{ studentId: user.id }, { expertId: user.id }],
          },
      include: {
        expert: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ dms });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to fetch priority DMs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const sessionUser = session.user as AuthorizedUser;

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId: data.expertId },
      include: {
        services: {
          where: { type: "PRIORITY_DM", status: "PUBLISHED" },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!expertProfile) {
      return NextResponse.json({ message: "Expert profile not found" }, { status: 404 });
    }

    const dmService = expertProfile.services[0];
    if (!dmService) {
      return NextResponse.json(
        { message: "This expert is not accepting priority DMs right now" },
        { status: 400 }
      );
    }

    const dm = await prisma.$transaction(async (tx) => {
      const packageItem = await findActivePackageItem(
        tx,
        sessionUser.id,
        dmService.id,
        expertProfile.id
      );

      const status = packageItem ? "PAID" : "PENDING_PAYMENT";
      const amount = packageItem ? 0 : dmService.price;

      const created = await tx.priorityDM.create({
        data: {
          expertId: data.expertId,
          studentId: sessionUser.id,
          title: data.title.trim(),
          question: data.question.trim(),
          context: data.context?.trim(),
          attachments: data.attachments,
          amount,
          dueHours: dmService.responseSlaHours,
          status,
        },
        include: {
          expert: { select: { id: true, name: true, email: true } },
          student: { select: { id: true, name: true, email: true } },
        },
      });

      if (packageItem) {
        await consumePackageForDM(tx, sessionUser.id, dmService.id, expertProfile.id, created.id);
      }

      return created;
    });

    return NextResponse.json({ dm }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Priority DM creation error:", error);
    return NextResponse.json({ message: "Failed to create priority DM" }, { status: 500 });
  }
}
