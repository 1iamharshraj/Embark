import { Queue } from "bullmq";
import { redis } from "./redis";

export const emailQueue = new Queue("email", { connection: redis });
export const notificationQueue = new Queue("notifications", { connection: redis });
export const certificateQueue = new Queue("certificates", { connection: redis });
export const paymentQueue = new Queue("payments", { connection: redis });
export const payoutQueue = new Queue("payouts", { connection: redis });

export const queues = {
  email: emailQueue,
  notifications: notificationQueue,
  certificates: certificateQueue,
  payments: paymentQueue,
  payouts: payoutQueue,
};
