import { notFound } from "next/navigation";
import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

export default async function JudgeSubmissionsPage({ params }: { params: { id: string } }) {
  const user = await checkPagePermission("hackathon.evaluation.view");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        include: {
          files: true,
          team: { select: { name: true } },
          judgeAssignments: { where: { judge: { userId: user.id } } },
          evaluations: { where: { judgeId: user.id }, select: { id: true, score: true, finalizedAt: true } },
        },
      },
    },
  });

  if (!hackathon) notFound();

  const assignedSubmissions = hackathon.submissions.filter((s) => s.judgeAssignments.length > 0 || user.isAdmin);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Eyebrow>Judge portal</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Submissions assigned to you for evaluation.</p>

          <div className="space-y-4">
            {assignedSubmissions.length === 0 && <p className="text-inkSoft">No submissions assigned yet.</p>}
            {assignedSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-charcoal/8 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-charcoal">{sub.title}</h3>
                  <p className="text-sm text-inkSoft">Team: {sub.team?.name || "Solo"}</p>
                  {sub.evaluations.length > 0 && (
                    <p className="text-sm text-charcoal mt-1 font-semibold">
                      Score: {sub.evaluations[0].score ?? "—"}
                      {sub.evaluations[0].finalizedAt && (
                        <span className="ml-2 text-xs font-normal text-green-700">Finalized</span>
                      )}
                    </p>
                  )}
                </div>
                <Link
                  href={`/judge/hackathons/${params.id}/submissions/${sub.id}`}
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition text-sm"
                >
                  Evaluate
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
