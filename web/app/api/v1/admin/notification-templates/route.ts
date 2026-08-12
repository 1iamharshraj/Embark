import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

const createSchema = z.object({
  name: z.string().min(1),
  channel: z.enum(["EMAIL", "IN_APP", "WHATSAPP"]),
  subject: z.string().optional(),
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "notification.template.manage");

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Fetch templates error:", error);
    return NextResponse.json({ message: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "notification.template.manage");

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const template = await prisma.notificationTemplate.create({ data: parsed.data });
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("Create template error:", error);
    return NextResponse.json({ message: "Failed to create template" }, { status: 500 });
  }
}
