import { prisma } from "./prisma";

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
    },
  });
}

export async function notifyExpertVerification(
  userId: string,
  expertProfileId: string,
  status: "VERIFIED" | "REJECTED",
  note?: string | null
) {
  const title = status === "VERIFIED" ? "Expert profile verified" : "Expert verification rejected";
  const message =
    status === "VERIFIED"
      ? "Congratulations! Your expert profile has been verified and is now public."
      : note
      ? `Your expert verification was rejected. Note: ${note}`
      : "Your expert verification was rejected. Please review your documents and resubmit.";

  return createNotification({
    userId,
    type: "EXPERT_VERIFICATION",
    title,
    message,
    entityType: "ExpertProfile",
    entityId: expertProfileId,
  });
}
