import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({
  active: z.boolean(),
});

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "expert.update");

    const expert = await prisma.expertProfile.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, active: true } } },
    });
    if (!expert) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { active } = parsed.data;
    const previous = { active: expert.user.active };

    const updated = await prisma.user.update({
      where: { id: expert.user.id },
      data: { active },
    });

    await createAuditLog({
      userId: user.id,
      action: active ? "EXPERT_ACTIVATED" : "EXPERT_SUSPENDED",
      resource: "ExpertProfile",
      resourceId: params.id,
      oldValue: previous,
      newValue: { active },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Update expert status error:", error);
    return NextResponse.json({ error: "Failed to update expert status" }, { status: 500 });
  }
}
