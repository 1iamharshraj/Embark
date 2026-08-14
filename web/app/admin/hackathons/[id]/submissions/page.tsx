import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
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
    <>
      <AdminHeader
        eyebrow="Submissions"
        title={hackathon.title}
        description="Review submissions and assign them to judges."
        backHref={`/admin/hackathons/${params.id}/edit`}
        backLabel="Back to edit hackathon"
      />
      <SubmissionAssignments
        submissions={submissions}
        judges={hackathon.judges}
        assignments={assignments}
      />
    </>
  );
}
