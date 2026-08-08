import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { competitionStatus } from "@/lib/competition";

const roundSchema = z.object({
  name: z.string().min(1, "Round name is required"),
  brief: z.string().optional(),
  type: z.string().optional(),
  link: z.string().optional(),
  opens: z.string().optional(),
  closes: z.string().optional(),
});

const createSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  host: z.string().optional(),
  category: z.string().optional(),
  banner: z.string().optional(),
  fee: z.number().int().min(0).default(0),
  teamMin: z.number().int().min(1).default(1),
  teamMax: z.number().int().min(1).default(4),
  eligibility: z.string().optional(),
  about: z.string().optional(),
  rules: z.array(z.string()).default([]),
  prizes: z.any().optional(),
  ppo: z.boolean().default(false),
  beginner: z.boolean().default(false),
  published: z.boolean().default(false),
  regOpen: z.string().min(1, "Registration open date is required"),
  regClose: z.string().min(1, "Registration close date is required"),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  resultAt: z.string().optional(),
  rounds: z.array(roundSchema).min(1, "At least one round is required"),
  eligibilityCriteria: z.array(z.string()).default([]),
  teamStructure: z.array(z.string()).default([]),
  institutes: z.array(z.string()).default([]),
  compStructure: z.array(z.string()).default([]),
  submissionGuidelines: z.array(z.string()).default([]),
  contacts: z.any().optional(),
  aboutHost: z.string().optional(),
  faqs: z.any().optional(),
  viewBoost: z.number().int().default(0),
  seedRegs: z.number().int().default(0),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await prisma.competition.findMany({
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  const competitions = raw.map((c) => ({
    id: c.id,
    title: c.title,
    host: c.host,
    category: c.category,
    banner: c.banner,
    fee: c.fee,
    draft: c.draft,
    regOpen: c.regOpen.toISOString(),
    regClose: c.regClose.toISOString(),
    startAt: c.startAt.toISOString(),
    endAt: c.endAt.toISOString(),
    resultAt: c.resultAt?.toISOString() ?? null,
    status: competitionStatus(c),
    registrationCount: (c._count?.registrations ?? 0) + c.seedRegs,
  }));

  return NextResponse.json({ competitions });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;

  const existing = await prisma.competition.findUnique({ where: { id: data.id } });
  if (existing) {
    return NextResponse.json({ error: "Competition ID already exists" }, { status: 409 });
  }

  const competition = await prisma.competition.create({
    data: {
      id: data.id,
      title: data.title,
      host: data.host ?? "Embark India",
      category: data.category ?? "General Management",
      banner: data.banner ?? "orange",
      fee: data.fee,
      teamMin: data.teamMin,
      teamMax: data.teamMax,
      eligibility: data.eligibility ?? "",
      about: data.about ?? "",
      rules: data.rules,
      prizes: data.prizes ?? [],
      ppo: data.ppo,
      beginner: data.beginner,
      draft: !data.published,
      regOpen: new Date(data.regOpen),
      regClose: new Date(data.regClose),
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      resultAt: data.resultAt ? new Date(data.resultAt) : null,
      rounds: data.rounds as unknown as object,
      eligibilityCriteria: data.eligibilityCriteria,
      teamStructure: data.teamStructure,
      institutes: data.institutes,
      compStructure: data.compStructure,
      submissionGuidelines: data.submissionGuidelines,
      contacts: data.contacts ?? [],
      aboutHost: data.aboutHost ?? "",
      faqs: data.faqs ?? [],
      viewBoost: data.viewBoost,
      seedRegs: data.seedRegs,
    },
  });

  return NextResponse.json({ competition }, { status: 201 });
}
