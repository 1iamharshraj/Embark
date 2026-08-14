import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
  getUploadKey,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  getPublicUrl,
  isProductionStorage,
} from "@/lib/storage";

const allowedFolders = ["profiles", "resumes", "verifications", "hackathons", "submissions"] as const;

type Folder = (typeof allowedFolders)[number];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { folder, filename, contentType } = body as {
      folder: Folder;
      filename: string;
      contentType: string;
    };

    if (!allowedFolders.includes(folder)) {
      return NextResponse.json({ message: "Invalid folder" }, { status: 400 });
    }
    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ message: "Filename required" }, { status: 400 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = getUploadKey(folder, `${session.user.id}-${safeName}`);

    if (isProductionStorage()) {
      const putUrl = await getSignedUploadUrl(key, contentType, 300);
      return NextResponse.json({
        key,
        putUrl,
        getUrl: await getSignedDownloadUrl(key),
        publicUrl: getPublicUrl(key),
      });
    }

    // Local dev fallback: return local upload endpoint so client can POST to /api/uploads directly.
    return NextResponse.json({
      key,
      putUrl: `/api/uploads?key=${encodeURIComponent(key)}`,
      getUrl: `/api/uploads/${key}`,
      publicUrl: `/api/uploads/${key}`,
    });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ message: "Failed to generate upload URL" }, { status: 500 });
  }
}
