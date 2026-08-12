import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { submissionOpen } from "@/lib/hackathon";
import SubmissionForm from "./_components/SubmissionForm";

export default async function HackathonSubmitPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/hackathon/${params.slug}/submit`);
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { slug: params.slug },
    include: { timelines: { orderBy: { startsAt: "asc" } } },
  });

  if (!hackathon) notFound();

  const team = await prisma.hackathonTeam.findFirst({
    where: { hackathonId: hackathon.id, members: { some: { userId: session.user.id } } },
  });

  const existing = team
    ? await prisma.hackathonSubmission.findFirst({
        where: { hackathonId: hackathon.id, teamId: team.id },
        include: { files: true },
      })
    : null;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Submit</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Submit your solution before the deadline.</p>
          <SubmissionForm
            hackathon={{
              id: hackathon.id,
              slug: hackathon.slug,
              title: hackathon.title,
              submissionOpen: submissionOpen(hackathon),
            }}
            team={team ? { id: team.id, name: team.name } : null}
            existing={
              existing
                ? {
                    id: existing.id,
                    title: existing.title,
                    content: existing.content as Record<string, unknown>,
                    files: existing.files,
                  }
                : null
            }
          />
        </div>
      </Container>
    </section>
  );
}
