import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import AvailabilityManager from "./_components/AvailabilityManager";

export default async function ExpertAvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availabilities: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!expertProfile) redirect("/expert/onboarding");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Marketplace</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            Your availability
          </h1>
          <p className="text-inkSoft mb-8">
            Set your weekly hours. Students will see bookable slots based on these windows.
          </p>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <AvailabilityManager expertProfileId={expertProfile.id} initial={expertProfile.availabilities} />
          </div>
        </div>
      </Container>
    </section>
  );
}
