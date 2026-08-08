import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playbook = await prisma.playbook.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!playbook) {
    return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
  }

  const progress = await prisma.playbookProgress.findUnique({
    where: { userId_playbookId: { userId: session.user.id, playbookId: playbook.id } },
  });

  return NextResponse.json({ checked: progress?.checked ?? [] });
}

const progressSchema = z.object({
  checked: z.array(z.number().int().min(0)),
});

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playbook = await prisma.playbook.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!playbook) {
    return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  await prisma.playbookProgress.upsert({
    where: { userId_playbookId: { userId: session.user.id, playbookId: playbook.id } },
    create: { userId: session.user.id, playbookId: playbook.id, checked: parsed.data.checked },
    update: { checked: parsed.data.checked },
  });

  return NextResponse.json({ ok: true });
}
