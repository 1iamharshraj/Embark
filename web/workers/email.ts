import { Worker } from "bullmq";
import { Resend } from "resend";
import { redis } from "@/lib/redis";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const from = process.env.EMAIL_FROM || "Embark India <hello@embarkindia.in>";

const worker = new Worker(
  "email",
  async (job) => {
    const { to, subject, html, text } = job.data as {
      to: string;
      subject: string;
      html: string;
      text?: string;
    };

    if (!to || !subject || !html) {
      console.warn(`[email-worker] skipping job ${job.id}: missing fields`);
      return { skipped: true };
    }

    if (!resend) {
      console.log(`[email-worker] RESEND_API_KEY missing; would send to ${to}: ${subject}`);
      console.log("--- EMAIL HTML START ---");
      console.log(html);
      console.log("--- EMAIL HTML END ---");
      return { logged: true };
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[email-worker] failed to send to ${to}:`, error);
      throw new Error(error.message);
    }

    console.log(`[email-worker] sent to ${to}: ${data?.id}`);
    return { id: data?.id };
  },
  { connection: redis, concurrency: 5 }
);

worker.on("failed", (job, err) => {
  console.error(`[email-worker] job ${job?.id} failed:`, err?.message || err);
});

worker.on("ready", () => {
  console.log("[email-worker] ready");
});

console.log("[email-worker] starting...");

// Keep process alive
process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
