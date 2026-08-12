import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getUploadKey, getSignedDownloadUrl, isProductionStorage } from "@/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";

const allowedFolders = ["profiles", "resumes", "verifications"] as const;

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
      const client = new S3Client({
        region: process.env.AWS_REGION || "auto",
        endpoint: process.env.R2_ENDPOINT || undefined,
        forcePathStyle: Boolean(process.env.R2_ENDPOINT),
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      });

      const putUrl = await getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || "",
          Key: key,
          ContentType: contentType || "application/octet-stream",
        }),
        { expiresIn: 300 }
      );

      return NextResponse.json({ key, putUrl, getUrl: await getSignedDownloadUrl(key) });
    }

    // Local dev fallback: return local upload endpoint so client can POST to /api/uploads directly.
    return NextResponse.json({ key, putUrl: `/api/uploads?key=${encodeURIComponent(key)}`, getUrl: `/api/uploads/${key}` });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ message: "Failed to generate upload URL" }, { status: 500 });
  }
}
