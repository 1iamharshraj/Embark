import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { generateCertificate } from "@/lib/certificate";
import { parseMembers } from "@/lib/competition";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: compId } = params;
  const competition = await prisma.competition.findUnique({
    where: { id: compId },
    include: {
      winners: true,
    },
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

  const members = parseMembers(registration.members).map((m) => m.name).filter(Boolean);
  const names = members.length ? members : [session.user.name ?? "Participant"];

  const now = new Date();
  const hasResults = competition.winners.length > 0;
  const isClosed = now > competition.endAt;
  const winner = competition.winners.find((w) => w.regId === registration.id);

  let type: "participation" | "winner" = "participation";
  let rank: number | undefined;

  if (winner) {
    type = "winner";
    rank = winner.rank;
  } else if (!hasResults && !isClosed) {
    return NextResponse.json({ error: "Certificates are not available yet" }, { status: 400 });
  }

  const date = competition.resultAt?.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) ?? now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  try {
    const buffer = generateCertificate({
      type,
      competitionTitle: competition.title,
      teamName: registration.teamName,
      names,
      rank,
      date,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="embark-certificate-${compId}.png"`,
      },
    });
  } catch (error) {
    console.error("Certificate generation failed:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
