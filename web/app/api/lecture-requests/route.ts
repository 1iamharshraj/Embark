import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lectureSchema = z.object({
  institute: z.string().min(2, "Institute name is required"),
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  vertical: z.string().min(1, "Pick a topic vertical"),
  engagement: z.string().min(1, "Type of engagement is required"),
  format: z.string().min(1, "Format is required"),
  dates: z.string().optional(),
  audienceSize: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = lectureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const requestRecord = await prisma.lectureRequest.create({
    data: {
      ...data,
      audienceSize: data.audienceSize ?? "",
      budget: data.budget ?? "",
      status: "pending",
      userId: session?.user?.id ?? null,
    },
  });

  console.log("[NEW LECTURE REQUEST]", {
    id: requestRecord.id,
    institute: requestRecord.institute,
    name: requestRecord.name,
    email: requestRecord.email,
    vertical: requestRecord.vertical,
    engagement: requestRecord.engagement,
    userId: session?.user?.id ?? null,
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const adminSession = await requireAdmin();
  if (!adminSession) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const requests = await prisma.lectureRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}
