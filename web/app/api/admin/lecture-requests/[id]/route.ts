import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["pending", "shortlisted", "confirmed", "completed", "cancelled"]),
  note: z.string().optional(),
});

async function updateRequest(id: string, request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "lecture.update");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { status, note } = parsed.data;
    const data: { status: string; note?: string } = { status };
    if (note !== undefined) data.note = note;

    const requestRecord = await prisma.lectureRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, request: requestRecord });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update lecture request" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return updateRequest(params.id, request);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return updateRequest(params.id, request);
}
