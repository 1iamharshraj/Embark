import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { collegesMatch } from "@/lib/competition";

const memberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  email: z.string().email("Valid member email is required"),
  college: z.string().min(1, "Member college is required"),
});

const registerSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  members: z.array(memberSchema).min(1, "At least one member is required"),
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

  if (!competition) {
    return NextResponse.json({ error: "Competition not found" }, { status: 404 });
  }

  if (competition.draft) {
    return NextResponse.json({ error: "Competition not published" }, { status: 404 });
  }

  if (competition.fee !== 0) {
    return NextResponse.json({ error: "Paid registrations are not supported yet" }, { status: 400 });
  }

  const now = new Date();
  if (now < competition.regOpen || now > competition.regClose) {
    return NextResponse.json({ error: "Registration is not open" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
  }

  const { teamName, members } = parsed.data;

  if (members.length < competition.teamMin || members.length > competition.teamMax) {
    return NextResponse.json(
      { error: `Team size must be between ${competition.teamMin} and ${competition.teamMax}` },
      { status: 400 }
    );
  }

  if (competition.institutes.length > 0) {
    const memberColleges = members.map((m) => m.college);
    if (!collegesMatch(competition.institutes, memberColleges)) {
      return NextResponse.json(
        { error: "All team members must be from an allowed institute" },
        { status: 400 }
      );
    }
  }

  const existing = await prisma.registration.findUnique({
    where: { userId_compId: { userId: session.user.id, compId } },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already registered for this competition" }, { status: 409 });
  }

  const registration = await prisma.registration.create({
    data: {
      userId: session.user.id,
      compId,
      teamName: teamName.trim(),
      members: members as unknown as object,
    },
  });

  return NextResponse.json({ registration });
}
