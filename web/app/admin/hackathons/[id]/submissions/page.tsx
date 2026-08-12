import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import SubmissionAssignments from "./_components/SubmissionAssignments";

export default async function AdminHackathonSubmissionsPage({ params }: { params: { id: string } }) {
  await checkPagePermission("hackathon.view");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        include: { files: true, team: { include: { members: { include: { user: { select: { id: true, name: true } } } } } } },
        orderBy: { createdAt: "desc" },
      },
      judges: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!hackathon) notFound();

  const assignments = await prisma.judgeAssignment.findMany({
    where: { hackathonId: params.id },
    include: {
      judge: { include: { user: { select: { id: true, name: true, email: true } } } },
      submission: { select: { id: true, title: true } },
    },
  });

  const submissions = hackathon.submissions.map((sub) => ({
    ...sub,
    createdAt: sub.createdAt.toISOString(),
  }));

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Button href={`/admin/hackathons/${params.id}/edit`} variant="ghost" size="sm">
            ← Back to edit hackathon
          </Button>
          <Eyebrow className="mt-4">Submissions</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Review submissions and assign them to judges.</p>

          <SubmissionAssignments
            submissions={submissions}
            judges={hackathon.judges}
            assignments={assignments}
          />
        </div>
      </Container>
    </section>
  );
}
