import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import ResultsPublish from "./_components/ResultsPublish";

export default async function AdminHackathonResultsPage({ params }: { params: { id: string } }) {
  await checkPagePermission("hackathon.view");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        include: {
          files: true,
          evaluations: { where: { finalizedAt: { not: null } }, select: { score: true } },
          team: { select: { name: true } },
          result: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!hackathon) notFound();

  const rows = hackathon.submissions.map((sub) => {
    const finalized = sub.evaluations.filter((e) => e.score !== null);
    const average =
      finalized.length > 0
        ? Math.round((finalized.reduce((sum, e) => sum + (e.score || 0), 0) / finalized.length) * 100) / 100
        : null;
    return {
      id: sub.id,
      title: sub.title,
      teamName: sub.team?.name || "Solo",
      finalizedCount: finalized.length,
      average,
      result: sub.result,
    };
  });

  const sortedRows = [...rows].sort((a, b) => (b.average ?? -1) - (a.average ?? -1));

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Button href={`/admin/hackathons/${params.id}/edit`} variant="ghost" size="sm">
            ← Back to edit hackathon
          </Button>
          <Eyebrow className="mt-4">Results</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Review finalized scores, rank submissions, and publish results.</p>

          <ResultsPublish hackathonId={hackathon.id} status={hackathon.status} />

          <div className="mt-8 bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Rank</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Submission</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Team</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Finalized evaluations</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Average score</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Award</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4 text-charcoal">
                      {row.result?.rank ?? (row.average !== null ? idx + 1 : "—")}
                    </td>
                    <td className="px-5 py-4 font-semibold text-charcoal">{row.title}</td>
                    <td className="px-5 py-4 text-inkSoft">{row.teamName}</td>
                    <td className="px-5 py-4 text-charcoal">{row.finalizedCount}</td>
                    <td className="px-5 py-4 text-charcoal">{row.average ?? "—"}</td>
                    <td className="px-5 py-4">
                      {row.result?.award ? (
                        <span className="inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-orangeSoft text-orangeDeep">
                          {row.result.award.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="text-inkSoft">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {sortedRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-inkSoft">
                      No submissions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
