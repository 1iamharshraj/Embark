import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { join } from "path";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { registration: { select: { userId: true } } },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.registration.userId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!submission.filePath) {
    return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
  }

  const absPath = join(process.cwd(), submission.filePath.replace(/\\/g, "/"));
  try {
    await stat(absPath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const filename = absPath.split("/").pop() || "submission";
  const stream = createReadStream(absPath);
  const headers = new Headers();
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("Content-Type", "application/octet-stream");

  return new Response(stream as unknown as ReadableStream, { headers });
}
