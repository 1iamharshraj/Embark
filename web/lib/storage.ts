import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join, dirname } from "path";

const BUCKET = process.env.S3_BUCKET_NAME || "";
const R2_ENDPOINT = process.env.R2_ENDPOINT || "";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
const AWS_REGION = process.env.AWS_REGION || "auto";

function s3Client(): S3Client {
  const isR2 = Boolean(R2_ENDPOINT);
  return new S3Client({
    region: isR2 ? "auto" : AWS_REGION,
    endpoint: isR2 ? R2_ENDPOINT : undefined,
    forcePathStyle: isR2,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
}

export function isProductionStorage(): boolean {
  return Boolean(
    BUCKET &&
      AWS_ACCESS_KEY_ID &&
      AWS_SECRET_ACCESS_KEY &&
      (R2_ENDPOINT || process.env.AWS_REGION)
  );
}

export function getUploadKey(folder: string, filename: string): string {
  return `${folder}/${Date.now()}-${filename}`;
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (isProductionStorage()) {
    const client = s3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return key;
  }

  const localPath = join(process.cwd(), key);
  await mkdir(dirname(localPath), { recursive: true });
  await writeFile(localPath, buffer);
  return key;
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (isProductionStorage()) {
    const client = s3Client();
    return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
      expiresIn: 3600,
    });
  }

  return `/api/uploads/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  if (isProductionStorage()) {
    const client = s3Client();
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return;
  }

  const localPath = join(process.cwd(), key);
  await unlink(localPath).catch(() => {
    // ignore missing files
  });
}
