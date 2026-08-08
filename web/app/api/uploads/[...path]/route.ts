import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { join } from "path";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let segments = params.path;
  if (segments[0] === "uploads") {
    segments = segments.slice(1);
  }
  const relativePath = `uploads/${segments.join("/")}`;

  // Only allow users to access their own uploads, unless they are an admin.
  if (!session.user.isAdmin) {
    const segments = relativePath.split("/");
    const ownerId = segments[1];
    if (ownerId && ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const absPath = join(process.cwd(), relativePath);

  try {
    await stat(absPath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const filename = absPath.split("/").pop() || "file";
  const stream = createReadStream(absPath);
  const headers = new Headers();
  headers.set("Content-Disposition", `inline; filename="${filename}"`);
  headers.set("Content-Type", "application/octet-stream");

  return new Response(stream as unknown as ReadableStream, { headers });
}
