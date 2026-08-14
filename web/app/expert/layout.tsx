import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ExpertShell from "./_components/ExpertShell";

export default async function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Determine the current path server-side
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Onboarding has its own standalone layout — skip the shell
  if (pathname.startsWith("/expert/onboarding")) {
    return <>{children}</>;
  }

  // Fetch the expert profile for the header (slug for public profile link)
  const profile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    select: { slug: true },
  });

  return (
    <ExpertShell
      expertSlug={profile?.slug ?? null}
      expertName={session.user.name}
    >
      {children}
    </ExpertShell>
  );
}
