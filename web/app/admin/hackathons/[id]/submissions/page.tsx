import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
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
        include: {
          user: { select: { id: true, name: true, email: true } },
          evaluations: { select: { finalizedAt: true } },
        },
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

  const judgeProgress = hackathon.judges.map((judge) => {
    const assigned = assignments.filter((a) => a.judgeId === judge.id).length;
    const finalized = judge.evaluations.filter((e) => e.finalizedAt !== null).length;
    return {
      id: judge.id,
      name: judge.user.name || judge.user.email,
      assigned,
      finalized,
      pending: Math.max(0, assigned - finalized),
    };
  });

  const totalAssigned = assignments.length;
  const totalFinalized = judgeProgress.reduce((sum, j) => sum + j.finalized, 0);

  return (
    <>
      <AdminHeader
        eyebrow="Submissions"
        title={hackathon.title}
        description="Review submissions, assign them to judges, and monitor evaluation progress."
        backHref={`/admin/hackathons/${params.id}/edit`}
        backLabel="Back to edit hackathon"
      />

      <AdminCard className="p-5 mb-6">
        <h2 className="text-sm font-semibold text-charcoal mb-3">Evaluation progress</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-cream rounded-xl p-4">
            <p className="text-xs text-inkSoft uppercase tracking-wider">Submissions</p>
            <p className="text-2xl font-bold text-charcoal">{hackathon.submissions.length}</p>
          </div>
          <div className="bg-cream rounded-xl p-4">
            <p className="text-xs text-inkSoft uppercase tracking-wider">Assignments</p>
            <p className="text-2xl font-bold text-charcoal">{totalAssigned}</p>
          </div>
          <div className="bg-cream rounded-xl p-4">
            <p className="text-xs text-inkSoft uppercase tracking-wider">Finalized</p>
            <p className="text-2xl font-bold text-charcoal">{totalFinalized}</p>
          </div>
        </div>

        {judgeProgress.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-4 py-2">Judge</th>
                  <th className="text-left font-semibold text-charcoal px-4 py-2">Assigned</th>
                  <th className="text-left font-semibold text-charcoal px-4 py-2">Finalized</th>
                  <th className="text-left font-semibold text-charcoal px-4 py-2">Pending</th>
                </tr>
              </thead>
              <tbody>
                {judgeProgress.map((j) => (
                  <tr key={j.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-4 py-2 text-charcoal">{j.name}</td>
                    <td className="px-4 py-2 text-charcoal">{j.assigned}</td>
                    <td className="px-4 py-2 text-green-700 font-semibold">{j.finalized}</td>
                    <td className="px-4 py-2 text-charcoal">{j.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <SubmissionAssignments
        submissions={submissions}
        judges={hackathon.judges}
        assignments={assignments}
      />
    </>
  );
}
