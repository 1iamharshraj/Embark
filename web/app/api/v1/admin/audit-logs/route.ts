import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "audit.view");

    const { searchParams } = new URL(request.url);
    const actor = searchParams.get("actor") || undefined;
    const action = searchParams.get("action") || undefined;
    const resource = searchParams.get("resource") || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));

    const where: {
      action?: { contains: string; mode: "insensitive" };
      resource?: { contains: string; mode: "insensitive" };
      user?: { OR: { email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }[] };
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }
    if (resource) {
      where.resource = { contains: resource, mode: "insensitive" };
    }
    if (actor) {
      where.user = {
        OR: [
          { email: { contains: actor, mode: "insensitive" } },
          { name: { contains: actor, mode: "insensitive" } },
        ],
      };
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, email: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Audit logs error:", error);
    return NextResponse.json({ message: "Failed to load audit logs" }, { status: 500 });
  }
}
