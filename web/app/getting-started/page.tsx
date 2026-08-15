import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Container from "@/components/Container";
import GettingStartedForm from "./_components/GettingStartedForm";

export const metadata = {
  title: "Getting started — Embark India",
};

export default async function GettingStartedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.onboardingComplete) {
    redirect("/account");
  }

  return (
    <section className="bg-cream min-h-screen py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-10">
            <GettingStartedForm userName={session.user.name ?? "there"} />
          </div>
        </div>
      </Container>
    </section>
  );
}
