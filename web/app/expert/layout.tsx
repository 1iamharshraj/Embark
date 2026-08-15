import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import ExpertShell from "./_components/ExpertShell";

export default async function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // ExpertShell is now a minimal page container (no sidebar) — safe to wrap all /expert/* pages including onboarding.
  return <ExpertShell>{children}</ExpertShell>;
}
