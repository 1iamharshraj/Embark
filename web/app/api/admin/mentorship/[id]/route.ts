import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "paid"]),
  note: z.string().optional(),
});

async function updateBooking(id: string, request: Request) {
  try {
    const user = await requireAuth();
    requirePermission(user, "mentorship.update");

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

    const booking = await prisma.bookingRequest.update({
      where: { id },
      data,
      include: { user: true, mentor: true },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return updateBooking(params.id, request);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return updateBooking(params.id, request);
}
