import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bookingSchema = z.object({
  mentorSlug: z.string().min(1, "Mentor slug is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  topic: z.string().min(1, "Topic is required"),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const { mentorSlug, topic } = parsed.data;

  const mentor = await prisma.mentor.findUnique({
    where: { slug: mentorSlug },
  });
  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const bookingRequest = await prisma.bookingRequest.create({
    data: {
      userId: session.user.id,
      mentorId: mentor.id,
      topic,
      status: "pending",
      amount: mentor.price,
    },
    include: { user: true, mentor: true },
  });

  console.log("[NEW MENTORSHIP REQUEST]", {
    id: bookingRequest.id,
    userEmail: bookingRequest.user.email,
    userName: bookingRequest.user.name,
    mentorName: bookingRequest.mentor.name,
    topic,
    amount: bookingRequest.amount,
  });

  return NextResponse.json({ ok: true, bookingRequest });
}
