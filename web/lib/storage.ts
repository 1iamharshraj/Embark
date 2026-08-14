import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join, dirname } from "path";

const BUCKET = process.env.S3_BUCKET_NAME || "";
const R2_ENDPOINT = process.env.R2_ENDPOINT || "";
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || "";
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

function publicS3Client(): S3Client {
  // Use the public-facing endpoint for URLs returned to browsers.
  // In local Docker this is http://localhost:9000, while the internal
  // R2_ENDPOINT (http://minio:9000) is only reachable server-to-server.
  const endpoint = S3_PUBLIC_URL || R2_ENDPOINT || undefined;
  const isCustom = Boolean(endpoint);
  return new S3Client({
    region: isCustom ? "auto" : AWS_REGION,
    endpoint,
    forcePathStyle: isCustom,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
}

function publicBaseUrl(): string {
  if (!isProductionStorage()) return "";
  const base = (S3_PUBLIC_URL || R2_ENDPOINT).replace(/\/$/, "");
  return `${base}/${BUCKET}`;
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
    await ensureBucket(client);
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

export function getPublicUrl(key: string): string {
  if (isProductionStorage()) {
    return `${publicBaseUrl()}/${key}`;
  }
  return `/api/uploads/${key}`;
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (isProductionStorage()) {
    const client = publicS3Client();
    return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
      expiresIn: 3600,
    });
  }

  return `/api/uploads/${key}`;
}

async function ensureBucket(client: S3Client): Promise<void> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch {
    try {
      await client.send(new CreateBucketCommand({ Bucket: BUCKET }));
    } catch (createError: unknown) {
      // Bucket may have been created by another concurrent request.
      const err = createError as { name?: string; Code?: string };
      if (err.name !== "BucketAlreadyExists" && err.Code !== "BucketAlreadyExists") {
        console.error("Failed to create bucket:", createError);
      }
    }
  }
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  if (!isProductionStorage()) {
    return `/api/uploads?key=${encodeURIComponent(key)}`;
  }
  // Use internal client to ensure bucket exists; public client for presigned URL.
  await ensureBucket(s3Client());
  const client = publicS3Client();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    }),
    { expiresIn }
  );
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
