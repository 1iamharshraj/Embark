import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

const patchSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "paid"]),
  note: z.string().optional(),
});

async function updateBooking(id: string, request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return updateBooking(params.id, request);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return updateBooking(params.id, request);
}
