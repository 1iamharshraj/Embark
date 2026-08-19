import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { certificateTypeLabel } from "@/lib/certificate";

export const dynamic = "force-dynamic";

const PUBLISHED_STATUSES = ["RESULTS_PUBLISHED", "CERTIFICATES_ISSUED", "CLOSED"];

function getCollege(team: { leader?: { college?: string | null }; members?: { user?: { college?: string | null } }[] } | null): string | null {
  if (!team) return null;
  const colleges = new Set<string>();
  if (team.leader?.college) colleges.add(team.leader.college);
  team.members?.forEach((m) => {
    if (m.user?.college) colleges.add(m.user.college);
  });
  return Array.from(colleges).join(", ") || null;
}

export default async function HackathonResultsPage({ params }: { params: { slug: string } }) {
  const hackathon = await prisma.hackathon.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
    include: {
      timelines: { orderBy: { startsAt: "asc" } },
      results: {
        include: {
          submission: {
            include: {
              team: {
                include: {
                  leader: { select: { name: true, college: true } },
                  members: { include: { user: { select: { name: true, college: true } } } },
                },
              },
            },
          },
        },
        orderBy: { rank: "asc" },
      },
    },
  });

  if (!hackathon || hackathon.status === "DRAFT" || !PUBLISHED_STATUSES.includes(hackathon.status)) {
    notFound();
  }

  const settings = (hackathon.settings as Record<string, unknown> | undefined) ?? {};
  const showScores = settings.showScores === true;

  const winner = hackathon.results.find((r) => r.award === "WINNER") ?? null;
  const runnerUp = hackathon.results.find((r) => r.award === "RUNNER_UP") ?? null;
  const finalists = hackathon.results.filter((r) => r.award === "FINALIST");
  const specialAwards = hackathon.results.filter((r) => r.award && !["WINNER", "RUNNER_UP", "FINALIST"].includes(r.award));
  const others = hackathon.results.filter((r) => !r.award);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Link href={`/hackathon/${hackathon.slug}`} className="text-sm font-semibold text-orangeDeep hover:underline inline-block mb-4">
            ← Back to hackathon
          </Link>
          <Eyebrow>Results</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Congratulations to all participants and winners.</p>

          {winner && (
            <div className="bg-white rounded-2xl border-2 border-orangeDeep p-6 sm:p-8 mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-orangeDeep mb-2">Winner</p>
              <h2 className="font-display font-bold text-2xl text-charcoal mb-1">{winner.submission.title}</h2>
              <p className="text-inkSoft mb-1">{winner.submission.team?.name || "Solo participant"}</p>
              {getCollege(winner.submission.team) && (
                <p className="text-sm text-inkSoft mb-3">{getCollege(winner.submission.team)}</p>
              )}
              {showScores && winner.score !== null && (
                <p className="text-sm font-semibold text-charcoal">Score: {winner.score}</p>
              )}
            </div>
          )}

          {runnerUp && (
            <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-2">Runner-up</p>
              <h3 className="font-display font-bold text-xl text-charcoal">{runnerUp.submission.title}</h3>
              <p className="text-inkSoft">{runnerUp.submission.team?.name || "Solo participant"}</p>
              {getCollege(runnerUp.submission.team) && <p className="text-sm text-inkSoft">{getCollege(runnerUp.submission.team)}</p>}
              {showScores && runnerUp.score !== null && <p className="text-sm font-semibold text-charcoal mt-2">Score: {runnerUp.score}</p>}
            </div>
          )}

          {finalists.length > 0 && (
            <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8 mb-6">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Finalists</h2>
              <div className="space-y-3">
                {finalists.map((result) => (
                  <div key={result.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-charcoal/8 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="font-semibold text-charcoal">{result.submission.title}</p>
                      <p className="text-sm text-inkSoft">{result.submission.team?.name || "Solo participant"}</p>
                      {getCollege(result.submission.team) && <p className="text-xs text-inkSoft">{getCollege(result.submission.team)}</p>}
                    </div>
                    {showScores && result.score !== null && <p className="text-sm font-semibold text-charcoal">{result.score}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {specialAwards.length > 0 && (
            <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8 mb-6">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Special recognition</h2>
              <div className="space-y-3">
                {specialAwards.map((result) => (
                  <div key={result.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-charcoal/8 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="font-semibold text-charcoal">{result.submission.title}</p>
                      <p className="text-sm text-inkSoft">{result.submission.team?.name || "Solo participant"}</p>
                      <span className="inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 bg-orangeSoft text-orangeDeep mt-1">
                        {certificateTypeLabel(result.award || "")}
                      </span>
                    </div>
                    {showScores && result.score !== null && <p className="text-sm font-semibold text-charcoal">{result.score}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">All ranked submissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-charcoal/8">
                    <tr>
                      <th className="text-left font-semibold text-charcoal px-4 py-2">Rank</th>
                      <th className="text-left font-semibold text-charcoal px-4 py-2">Submission</th>
                      <th className="text-left font-semibold text-charcoal px-4 py-2">Team</th>
                      {showScores && <th className="text-left font-semibold text-charcoal px-4 py-2">Score</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {others.map((result) => (
                      <tr key={result.id} className="border-b border-charcoal/8 last:border-0">
                        <td className="px-4 py-3 text-charcoal">{result.rank}</td>
                        <td className="px-4 py-3 font-semibold text-charcoal">{result.submission.title}</td>
                        <td className="px-4 py-3 text-inkSoft">{result.submission.team?.name || "Solo"}</td>
                        {showScores && <td className="px-4 py-3 text-charcoal">{result.score ?? "—"}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hackathon.results.length === 0 && (
            <div className="bg-white rounded-2xl border border-charcoal/8 p-8 text-center">
              <p className="text-inkSoft">Results have not been published yet.</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
