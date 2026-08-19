import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import ExpertWorkspaceShell from "./_components/ExpertWorkspaceShell";

export default async function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return <ExpertWorkspaceShell>{children}</ExpertWorkspaceShell>;
}
