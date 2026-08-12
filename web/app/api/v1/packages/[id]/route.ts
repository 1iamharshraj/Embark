import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

const itemSchema = z.object({
  serviceId: z.string().min(1),
  quantity: z.coerce.number().min(1),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  validityDays: z.coerce.number().min(1).optional(),
  isActive: z.boolean().optional(),
  items: z.array(itemSchema).optional(),
});

async function canModifyPackage(sessionUser: AuthorizedUser, id: string) {
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: { expertProfile: { select: { userId: true } } },
  });

  if (!pkg) return { error: "Package not found", status: 404 };

  if (!sessionUser.isAdmin) {
    requireResourceOwner(sessionUser, pkg.expertProfile.userId);
    requirePermission(sessionUser, "package.update");
  }

  return { pkg };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const pkg = await prisma.package.findUnique({
      where: { id: params.id, isActive: true },
      include: {
        expertProfile: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
        items: {
          include: { service: { select: { id: true, name: true, durationMinutes: true, price: true, type: true } } },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    console.error("Package fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch package" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const result = await canModifyPackage(session.user as AuthorizedUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {
      name: data.name,
      description: data.description?.trim(),
      price: data.price,
      validityDays: data.validityDays,
      isActive: data.isActive,
    };

    const updated = await prisma.package.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(data.items
          ? {
              items: {
                deleteMany: {},
                create: data.items,
              },
            }
          : {}),
      },
      include: {
        items: {
          include: { service: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({ package: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await canModifyPackage(session.user as AuthorizedUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    await prisma.package.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to delete package" }, { status: 500 });
  }
}
