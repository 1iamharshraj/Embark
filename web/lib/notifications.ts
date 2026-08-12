import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";

export type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  sendEmail?: boolean;
  email?: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  };
};

export async function createNotification(input: NotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
    },
  });

  if (input.sendEmail && input.email) {
    await sendEmailQueue(input.email);
  }

  return notification;
}

export async function sendEmailQueue(payload: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  await emailQueue.add("send-email", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}

export async function scheduleBookingReminders(
  userEmail: string,
  userName: string,
  bookingId: string,
  serviceName: string,
  scheduledAt: Date
) {
  const now = Date.now();
  const scheduledTime = new Date(scheduledAt).getTime();
  const oneHourDelay = scheduledTime - now - 60 * 60 * 1000;
  const oneDayDelay = scheduledTime - now - 24 * 60 * 60 * 1000;

  const basePayload = {
    to: userEmail,
    subject: `Reminder: ${serviceName} session`,
    html: `<p>Hi ${escapeHtml(userName || "there")},</p><p>This is a reminder for your <strong>${escapeHtml(
      serviceName
    )}</strong> session coming up soon.</p><p>— Embark India</p>`,
    text: `Hi ${userName || "there"},\n\nThis is a reminder for your ${serviceName} session coming up soon.\n\n— Embark India`,
  };

  const opts = { attempts: 3, backoff: { type: "exponential" as const, delay: 5000 } };

  if (oneDayDelay > 0) {
    await emailQueue.add(
      `booking-reminder-24h-${bookingId}`,
      { ...basePayload, subject: `Reminder: ${serviceName} in 24 hours` },
      { ...opts, delay: oneDayDelay }
    );
  }

  if (oneHourDelay > 0) {
    await emailQueue.add(
      `booking-reminder-1h-${bookingId}`,
      { ...basePayload, subject: `Reminder: ${serviceName} in 1 hour` },
      { ...opts, delay: oneHourDelay }
    );
  }
}

export async function notifyExpertVerification(
  userId: string,
  expertProfileId: string,
  status: string,
  note?: string
) {
  const title = status === "VERIFIED" ? "Expert profile verified" : "Expert verification update";
  const message =
    status === "VERIFIED"
      ? "Your expert profile has been verified and is now public."
      : `Your expert verification was not approved.${note ? ` Note: ${note}` : ""}`;

  const expert = await prisma.expertProfile.findUnique({
    where: { id: expertProfileId },
    include: { user: { select: { email: true, name: true } } },
  });

  await createNotification({
    userId,
    type: "EXPERT_VERIFICATION",
    title,
    message,
    entityType: "ExpertProfile",
    entityId: expertProfileId,
    sendEmail: !!expert,
    email: expert
      ? {
          to: expert.user.email,
          subject: title,
          html: `<p>Hi ${escapeHtml(expert.user.name || "there")},</p><p>${escapeHtml(
            message
          )}</p><p>— Embark India</p>`,
          text: `Hi ${expert.user.name || "there"},\n\n${message}\n\n— Embark India`,
        }
      : undefined,
  });
}

export async function notifyWelcome(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) return;

  await createNotification({
    userId,
    type: "WELCOME",
    title: "Welcome to Embark India",
    message: "Your account is ready. Explore mentors, competitions, and expert guidance.",
    sendEmail: true,
    email: {
      to: user.email,
      subject: "Welcome to Embark India",
      html: `<p>Hi ${escapeHtml(user.name || "there")},</p><p>Welcome to Embark India — your account is ready. Start exploring mentors, competitions, and expert guidance.</p><p>— Embark India</p>`,
      text: `Hi ${user.name || "there"},\n\nWelcome to Embark India — your account is ready. Start exploring mentors, competitions, and expert guidance.\n\n— Embark India`,
    },
  });
}

export async function notifyPaymentConfirmation(
  userId: string,
  orderId: string,
  amount: number,
  orderType: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) return;

  const label = orderType.replace(/_/g, " ").toLowerCase();
  await createNotification({
    userId,
    type: "PAYMENT_CONFIRMED",
    title: "Payment confirmed",
    message: `Your payment of ₹${(amount / 100).toFixed(2)} for ${label} has been received.`,
    entityType: "Order",
    entityId: orderId,
    sendEmail: true,
    email: {
      to: user.email,
      subject: "Payment confirmed — Embark India",
      html: `<p>Hi ${escapeHtml(user.name || "there")},</p><p>We received your payment of ₹${(
        amount / 100
      ).toFixed(2)} for ${escapeHtml(label)}. Order: <strong>${orderId}</strong></p><p>— Embark India</p>`,
      text: `Hi ${user.name || "there"},\n\nWe received your payment of ₹${(amount / 100).toFixed(
        2
      )} for ${label}. Order: ${orderId}\n\n— Embark India`,
    },
  });
}

export async function notifyBookingConfirmed(
  clientId: string,
  expertId: string,
  bookingId: string,
  serviceName: string,
  scheduledAt: Date
) {
  const [client, expert] = await Promise.all([
    prisma.user.findUnique({ where: { id: clientId }, select: { email: true, name: true } }),
    prisma.user.findUnique({ where: { id: expertId }, select: { email: true, name: true } }),
  ]);

  if (client) {
    await createNotification({
      userId: clientId,
      type: "BOOKING_CONFIRMED",
      title: "Booking confirmed",
      message: `Your ${serviceName} session is confirmed for ${scheduledAt.toLocaleString()}.`,
      entityType: "Booking",
      entityId: bookingId,
      sendEmail: true,
      email: {
        to: client.email,
        subject: "Booking confirmed — Embark India",
        html: `<p>Hi ${escapeHtml(client.name || "there")},</p><p>Your <strong>${escapeHtml(
          serviceName
        )}</strong> session is confirmed for ${escapeHtml(
          scheduledAt.toLocaleString()
        )}.</p><p>— Embark India</p>`,
        text: `Hi ${client.name || "there"},\n\nYour ${serviceName} session is confirmed for ${scheduledAt.toLocaleString()}.\n\n— Embark India`,
      },
    });

    try {
      await scheduleBookingReminders(client.email, client.name, bookingId, serviceName, scheduledAt);
    } catch (err) {
      console.error("Failed to schedule booking reminders:", err);
    }
  }

  if (expert) {
    await createNotification({
      userId: expertId,
      type: "NEW_BOOKING",
      title: "New booking",
      message: `You have a new ${serviceName} booking scheduled for ${scheduledAt.toLocaleString()}.`,
      entityType: "Booking",
      entityId: bookingId,
      sendEmail: true,
      email: {
        to: expert.email,
        subject: "New booking — Embark India",
        html: `<p>Hi ${escapeHtml(expert.name || "there")},</p><p>You have a new <strong>${escapeHtml(
          serviceName
        )}</strong> booking on ${escapeHtml(
          scheduledAt.toLocaleString()
        )}. View your dashboard for details.</p><p>— Embark India</p>`,
        text: `Hi ${expert.name || "there"},\n\nYou have a new ${serviceName} booking on ${scheduledAt.toLocaleString()}. View your dashboard for details.\n\n— Embark India`,
      },
    });
  }
}

export async function notifyBookingCompleted(
  clientId: string,
  expertId: string,
  bookingId: string,
  serviceName: string
) {
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { email: true, name: true },
  });

  await createNotification({
    userId: clientId,
    type: "BOOKING_COMPLETED",
    title: "Session completed",
    message: `Your ${serviceName} session is complete. Share a review!`,
    entityType: "Booking",
    entityId: bookingId,
    sendEmail: !!client,
    email: client
      ? {
          to: client.email,
          subject: "How was your session?",
          html: `<p>Hi ${escapeHtml(client.name || "there")},</p><p>Your <strong>${escapeHtml(
            serviceName
          )}</strong> session is complete. Share a review to help others.</p><p>— Embark India</p>`,
          text: `Hi ${client.name || "there"},\n\nYour ${serviceName} session is complete. Share a review to help others.\n\n— Embark India`,
        }
      : undefined,
  });

  if (expertId) {
    const expert = await prisma.user.findUnique({
      where: { id: expertId },
      select: { email: true, name: true },
    });
    await createNotification({
      userId: expertId,
      type: "BOOKING_COMPLETED_EXPERT",
      title: "Session completed",
      message: `Your ${serviceName} session has been marked complete.`,
      entityType: "Booking",
      entityId: bookingId,
      sendEmail: !!expert,
      email: expert
        ? {
            to: expert.email,
            subject: "Session completed",
            html: `<p>Hi ${escapeHtml(expert.name || "there")},</p><p>Your <strong>${escapeHtml(
              serviceName
            )}</strong> session has been marked complete.</p><p>— Embark India</p>`,
            text: `Hi ${expert.name || "there"},\n\nYour ${serviceName} session has been marked complete.\n\n— Embark India`,
          }
        : undefined,
    });
  }
}

export async function notifyDMResponded(
  studentId: string,
  dmId: string,
  title: string,
  expertName: string
) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { email: true, name: true },
  });

  await createNotification({
    userId: studentId,
    type: "DM_RESPONDED",
    title: "Priority DM response received",
    message: `${expertName} responded to your priority DM: ${title}`,
    entityType: "PriorityDM",
    entityId: dmId,
    sendEmail: !!student,
    email: student
      ? {
          to: student.email,
          subject: "Your priority DM has a response",
          html: `<p>Hi ${escapeHtml(student.name || "there")},</p><p>${escapeHtml(
            expertName
          )} responded to your priority DM: <strong>${escapeHtml(title)}</strong></p><p>— Embark India</p>`,
          text: `Hi ${student.name || "there"},\n\n${expertName} responded to your priority DM: ${title}\n\n— Embark India`,
        }
      : undefined,
  });
}

export async function notifyNewDM(expertId: string, dmId: string, title: string) {
  const expert = await prisma.user.findUnique({
    where: { id: expertId },
    select: { email: true, name: true },
  });

  await createNotification({
    userId: expertId,
    type: "NEW_DM",
    title: "New priority DM",
    message: `You have a new priority DM: ${title}`,
    entityType: "PriorityDM",
    entityId: dmId,
    sendEmail: !!expert,
    email: expert
      ? {
          to: expert.email,
          subject: "New priority DM — Embark India",
          html: `<p>Hi ${escapeHtml(expert.name || "there")},</p><p>You have a new priority DM: <strong>${escapeHtml(
            title
          )}</strong></p><p>— Embark India</p>`,
          text: `Hi ${expert.name || "there"},\n\nYou have a new priority DM: ${title}\n\n— Embark India`,
        }
      : undefined,
  });
}

export async function notifyHackathonRegistration(
  userId: string,
  hackathonId: string,
  hackathonTitle: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  await createNotification({
    userId,
    type: "HACKATHON_REGISTRATION",
    title: "Hackathon registration confirmed",
    message: `You are registered for ${hackathonTitle}.`,
    entityType: "Hackathon",
    entityId: hackathonId,
    sendEmail: !!user,
    email: user
      ? {
          to: user.email,
          subject: "Hackathon registration confirmed",
          html: `<p>Hi ${escapeHtml(user.name || "there")},</p><p>You are registered for <strong>${escapeHtml(
            hackathonTitle
          )}</strong>.</p><p>— Embark India</p>`,
          text: `Hi ${user.name || "there"},\n\nYou are registered for ${hackathonTitle}.\n\n— Embark India`,
        }
      : undefined,
  });
}

export async function notifyHackathonResult(
  userId: string,
  hackathonId: string,
  hackathonTitle: string,
  award?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  const title = award ? `🎉 ${award}` : "Hackathon results published";
  const message = award
    ? `Results for ${hackathonTitle} are out. Congratulations!`
    : `Results for ${hackathonTitle} have been published.`;

  await createNotification({
    userId,
    type: "HACKATHON_RESULT",
    title,
    message,
    entityType: "Hackathon",
    entityId: hackathonId,
    sendEmail: !!user,
    email: user
      ? {
          to: user.email,
          subject: title,
          html: `<p>Hi ${escapeHtml(user.name || "there")},</p><p>${escapeHtml(message)}</p><p>— Embark India</p>`,
          text: `Hi ${user.name || "there"},\n\n${message}\n\n— Embark India`,
        }
      : undefined,
  });
}

export async function notifyCertificateIssued(
  userId: string,
  certificateId: string,
  hackathonTitle: string,
  type: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  await createNotification({
    userId,
    type: "CERTIFICATE_ISSUED",
    title: "Certificate issued",
    message: `Your ${type.toLowerCase()} certificate for ${hackathonTitle} is ready.`,
    entityType: "Certificate",
    entityId: certificateId,
    sendEmail: !!user,
    email: user
      ? {
          to: user.email,
          subject: "Certificate issued — Embark India",
          html: `<p>Hi ${escapeHtml(user.name || "there")},</p><p>Your ${escapeHtml(
            type.toLowerCase()
          )} certificate for <strong>${escapeHtml(
            hackathonTitle
          )}</strong> is ready.</p><p>— Embark India</p>`,
          text: `Hi ${user.name || "there"},\n\nYour ${type.toLowerCase()} certificate for ${hackathonTitle} is ready.\n\n— Embark India`,
        }
      : undefined,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
