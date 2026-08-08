import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const speakerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.string().min(2, "Current role is required"),
  company: z.string().min(1, "Company is required"),
  linkedIn: z.string().url("Enter a valid LinkedIn URL").min(1, "LinkedIn URL is required"),
  experience: z.string().min(1, "Experience is required"),
  vertical: z.string().min(1, "Pick a vertical"),
  city: z.string().optional(),
  format: z.string().min(1, "Format is required"),
  topics: z.string().min(10, "Tell us a few topics you'd speak on"),
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

  const parsed = speakerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const application = await prisma.speakerApplication.create({
    data: {
      ...data,
      status: "pending",
      userId: session?.user?.id ?? null,
    },
  });

  console.log("[NEW SPEAKER APPLICATION]", {
    id: application.id,
    name: application.name,
    email: application.email,
    role: application.role,
    company: application.company,
    vertical: application.vertical,
    userId: session?.user?.id ?? null,
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const adminSession = await requireAdmin();
  if (!adminSession) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const applications = await prisma.speakerApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}
