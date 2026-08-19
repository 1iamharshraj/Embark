import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import PackagesListClient from "./_components/PackagesListClient";

export default async function ExpertPackagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      packages: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { service: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  return <PackagesListClient packages={expertProfile.packages} />;
}
