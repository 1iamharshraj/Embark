import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { uploadFile, getUploadKey } from "@/lib/storage";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const competition = await prisma.competition.findUnique({ where: { id: params.id } });
  if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");
  const field = String(formData.get("field") ?? "banner");

  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = getUploadKey("competitions/banners", `${params.id}-${safeName}`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  await uploadFile(Buffer.from(bytes), key, file.type || "image/png");

  if (field === "logo") {
    await prisma.competition.update({
      where: { id: params.id },
      data: { banner: key },
    });
  } else {
    await prisma.competition.update({
      where: { id: params.id },
      data: { banners: { push: key } },
    });
  }

  return NextResponse.json({ url: key });
}
