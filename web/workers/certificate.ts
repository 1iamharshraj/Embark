import { Worker } from "bullmq";
import { randomBytes } from "crypto";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { generateCertificateImage } from "@/lib/certificate";
import { uploadFile, getUploadKey, getPublicUrl } from "@/lib/storage";

function generateCertificateId(): string {
  return `cert_${randomBytes(6).toString("hex")}`;
}

const worker = new Worker(
  "certificates",
  async (job) => {
    const { userId, hackathonId, type, baseUrl } = job.data as {
      userId: string;
      hackathonId: string;
      type: string;
      baseUrl: string;
    };

    const [user, hackathon] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } }),
      prisma.hackathon.findUnique({ where: { id: hackathonId }, select: { id: true, title: true } }),
    ]);

    if (!user || !hackathon) {
      console.warn(`[certificate-worker] missing user or hackathon for job ${job.id}`);
      return { skipped: true };
    }

    const existing = await prisma.certificate.findUnique({
      where: {
        hackathonId_userId_type: { hackathonId, userId, type },
      },
    });

    const certificateId = existing?.certificateId || generateCertificateId();
    const verificationUrl = `${baseUrl.replace(/\/$/, "")}/certificate/${certificateId}`;

    const issuedAt = new Date();
    const buffer = await generateCertificateImage({
      fullName: user.name,
      hackathonTitle: hackathon.title,
      type,
      certificateId,
      issuedAt,
      verificationUrl,
    });

    const key = getUploadKey("certificates", `${certificateId}.png`);
    await uploadFile(buffer, key, "image/png");
    const pdfUrl = getPublicUrl(key);

    const certificate = await prisma.certificate.upsert({
      where: {
        hackathonId_userId_type: { hackathonId, userId, type },
      },
      create: {
        hackathonId,
        userId,
        type,
        certificateId,
        verificationUrl,
        pdfUrl,
        status: "VALID",
        issuedAt,
      },
      update: {
        certificateId,
        verificationUrl,
        pdfUrl,
        status: "VALID",
        issuedAt,
      },
    });

    console.log(`[certificate-worker] generated certificate ${certificate.certificateId} for user ${userId}`);
    return { certificateId: certificate.certificateId };
  },
  { connection: redis, concurrency: 3 }
);

worker.on("failed", (job, err) => {
  console.error(`[certificate-worker] job ${job?.id} failed:`, err?.message || err);
});

worker.on("ready", () => {
  console.log("[certificate-worker] ready");
});

console.log("[certificate-worker] starting...");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
