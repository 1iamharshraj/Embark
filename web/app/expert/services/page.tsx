import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ServicesListClient from "./_components/ServicesListClient";

export default async function ExpertServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  return <ServicesListClient services={expertProfile.services} />;
}
