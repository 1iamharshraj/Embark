import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { parseRounds } from "@/lib/competition";

const submitSchema = z.object({
  roundIdx: z.number().int().min(0, "Invalid round index"),
  note: z.string().optional(),
  link: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: compId } = params;
  const competition = await prisma.competition.findUnique({
    where: { id: compId },
  });

  if (!competition || competition.draft) {
    return NextResponse.json({ error: "Competition not found" }, { status: 404 });
  }

  const registration = await prisma.registration.findUnique({
    where: { userId_compId: { userId: session.user.id, compId } },
  });
  if (!registration) {
    return NextResponse.json({ error: "You must register first" }, { status: 403 });
  }

  const rounds = parseRounds(competition.rounds);
  if (!rounds.length) {
    return NextResponse.json({ error: "No rounds defined" }, { status: 400 });
  }

  let roundIdx: number;
  let note = "";
  let link = "";
  let filePath: string | undefined;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const roundField = formData.get("roundIdx");
    roundIdx = roundField ? Number(roundField) : NaN;
    note = String(formData.get("note") ?? "");
    link = String(formData.get("link") ?? "");
    const file = formData.get("file");

    if (file && file instanceof File && file.size > 0) {
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const relDir = join("uploads", session.user.id, compId, `round${roundIdx}`);
      const absDir = join(process.cwd(), relDir);
      await mkdir(absDir, { recursive: true });
      const absPath = join(absDir, filename);
      const bytes = new Uint8Array(await file.arrayBuffer());
      await writeFile(absPath, bytes);
      filePath = join(relDir, filename).replace(/\\/g, "/");
    }
  } else {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    roundIdx = parsed.data.roundIdx;
    note = parsed.data.note ?? "";
    link = parsed.data.link ?? "";
  }

  if (Number.isNaN(roundIdx) || roundIdx < 0 || roundIdx >= rounds.length) {
    return NextResponse.json({ error: "Invalid round index" }, { status: 400 });
  }

  const round = rounds[roundIdx];
  const now = new Date();
  const opens = round.opens ? new Date(round.opens) : null;
  const closes = round.closes ? new Date(round.closes) : null;
  if ((opens && now < opens) || (closes && now > closes)) {
    return NextResponse.json({ error: "Round is not open for submissions" }, { status: 400 });
  }

  if (roundIdx > 0) {
    const advancement = await prisma.advancement.findUnique({
      where: { compId_regId_roundIdx: { compId, regId: registration.id, roundIdx: roundIdx - 1 } },
    });
    if (!advancement) {
      return NextResponse.json({ error: "You have not advanced to this round" }, { status: 403 });
    }
  }

  if (!link && !filePath) {
    return NextResponse.json({ error: "Provide a link or upload a file" }, { status: 400 });
  }

  const submission = await prisma.submission.upsert({
    where: { regId_roundIdx: { regId: registration.id, roundIdx } },
    create: {
      compId,
      regId: registration.id,
      userId: session.user.id,
      roundIdx,
      filePath,
      link: link || undefined,
      note,
    },
    update: {
      filePath: filePath ?? undefined,
      link: link || undefined,
      note,
    },
  });

  return NextResponse.json({ submission });
}
