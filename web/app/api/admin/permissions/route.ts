import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "permission.view");

    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
      include: {
        _count: { select: { roles: true } },
      },
    });

    return NextResponse.json({
      permissions: permissions.map((p) => ({
        id: p.id,
        resource: p.resource,
        action: p.action,
        description: p.description,
        roleCount: p._count.roles,
        key: `${p.resource}.${p.action}`,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "permission.create");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { resource, action, description } = parsed.data;

    const existing = await prisma.permission.findUnique({
      where: { resource_action: { resource, action } },
    });
    if (existing) {
      return NextResponse.json({ error: "Permission already exists" }, { status: 409 });
    }

    const permission = await prisma.permission.create({
      data: { resource, action, description },
    });

    return NextResponse.json({ permission }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create permission" }, { status: 500 });
  }
}
