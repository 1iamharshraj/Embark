import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const original = await prisma.service.findUnique({
      where: { id: params.id },
      include: { expertProfile: { select: { userId: true } } },
    });

    if (!original) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    const user = session.user as AuthorizedUser;
    if (!user.isAdmin) {
      requireResourceOwner(user, original.expertProfile.userId);
      requirePermission(user, "service.create");
    }

    const copy = await prisma.service.create({
      data: {
        expertProfileId: original.expertProfileId,
        createdById: user.id,
        type: original.type,
        name: `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        outcomes: original.outcomes,
        durationMinutes: original.durationMinutes,
        price: original.price,
        currency: original.currency,
        bufferMinutes: original.bufferMinutes,
        cancellationPolicy: original.cancellationPolicy,
        intakeQuestions: original.intakeQuestions as Prisma.InputJsonValue,
        meetingMethod: original.meetingMethod,
        responseSlaHours: original.responseSlaHours,
        status: "DRAFT",
        isActive: false,
        analytics: {
          create: {},
        },
      },
      include: { analytics: true },
    });

    return NextResponse.json({ service: copy }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to duplicate service" }, { status: 500 });
  }
}
