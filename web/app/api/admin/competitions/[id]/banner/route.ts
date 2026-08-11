import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { uploadFile, getUploadKey } from "@/lib/storage";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requirePermission(user, "competition.update");

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
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to upload banner" }, { status: 500 });
  }
}
