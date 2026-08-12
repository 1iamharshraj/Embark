import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  channel: z.enum(["EMAIL", "IN_APP", "WHATSAPP"]).optional(),
  subject: z.string().optional(),
  body: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "notification.template.manage");

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const template = await prisma.notificationTemplate.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ template });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Update template error:", error);
    return NextResponse.json({ message: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "notification.template.manage");

    await prisma.notificationTemplate.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Delete template error:", error);
    return NextResponse.json({ message: "Failed to delete template" }, { status: 500 });
  }
}
