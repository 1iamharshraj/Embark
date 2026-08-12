import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ExpertOnboardingForm from "./_components/ExpertOnboardingForm";

export default async function ExpertOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) redirect("/expert/verification");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Become an expert</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            Apply to be an expert
          </h1>
          <p className="text-inkSoft mb-8">
            Share your experience with MBA students. After submission your profile will be reviewed by the Embark team.
          </p>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <ExpertOnboardingForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
