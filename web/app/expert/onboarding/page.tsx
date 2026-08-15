import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ExpertOnboardingForm from "./_components/ExpertOnboardingForm";

export const metadata = {
  title: "Expert Onboarding — Embark India",
  description: "Set up your expert profile and start mentoring MBA students.",
};

export default async function ExpertOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Already completed onboarding — go straight to dashboard
  if (existing?.onboardingComplete) redirect("/expert/dashboard");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-10">
        <ExpertOnboardingForm userName={session.user.name} />
      </div>
    </div>
  );
}
