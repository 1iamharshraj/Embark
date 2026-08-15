import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ExpertAccountClient from "./_components/ExpertAccountClient";

export const metadata = {
  title: "Account — Expert Dashboard",
};

export default async function ExpertAccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true },
  });

  if (!user) redirect("/login");

  return <ExpertAccountClient user={user} />;
}
