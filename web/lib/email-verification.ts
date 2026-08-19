import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { sendEmailQueue } from "./notifications";

export async function createEmailVerificationToken(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  await prisma.emailVerificationToken.deleteMany({
    where: { email: normalizedEmail },
  });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerificationToken.create({
    data: { email: normalizedEmail, token, expiresAt },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;

  const html = `<p>Hi,</p><p>Please verify your email address by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p><p>— Embark India</p>`;
  const text = `Hi,\n\nPlease verify your email address by opening the link below:\n\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— Embark India`;

  try {
    await sendEmailQueue({ to: normalizedEmail, subject: "Verify your email — Embark India", html, text });
  } catch (err) {
    console.error("Failed to queue verification email:", err);
  }

  console.log("\n========================================");
  console.log("EMAIL VERIFICATION LINK:");
  console.log(verifyUrl);
  console.log("========================================\n");

  return { token, verifyUrl };
}

export async function verifyEmailToken(email: string, token: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || record.email !== normalizedEmail || record.expiresAt < new Date()) {
    return false;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { email: normalizedEmail },
    }),
  ]);

  return true;
}
