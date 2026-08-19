import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { uploadFile } from "@/lib/storage";
import { validateUploadedFile, validateFileSignatureForType } from "@/lib/fileValidation";

const ALLOWED_FOLDERS = new Set(["profiles", "resumes", "verifications", "hackathons", "submissions"]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const key = formData.get("key") as string | null;
    const file = formData.get("file");

    if (!key || !file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: "Key and file required" }, { status: 400 });
    }

    // Only allow uploads to the user's own prefixed keys.
    if (!key.includes(session.user.id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const folder = key.split("/")[0];
    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ message: "Invalid upload folder" }, { status: 400 });
    }

    const typeError = validateUploadedFile(folder, file);
    if (typeError) {
      return NextResponse.json({ message: typeError }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    const signatureError = validateFileSignatureForType(bytes, file.type || "application/octet-stream");
    if (signatureError) {
      return NextResponse.json({ message: signatureError }, { status: 400 });
    }

    await uploadFile(Buffer.from(bytes), key, file.type || "application/octet-stream");

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 });
  }
}
