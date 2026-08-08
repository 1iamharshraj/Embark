import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { parseMembers } from "@/lib/competition";

export default async function RegistrationsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/account");

  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        include: {
          user: { select: { id: true, name: true, email: true, college: true } },
          submissions: { orderBy: { roundIdx: "asc" } },
          advancements: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!competition) notFound();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/admin/competitions" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to competitions
          </Link>
          <Eyebrow>Registrations</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-2">{competition.title}</h1>
          <p className="text-inkSoft mb-8">{competition.registrations.length} registrations</p>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Team</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Lead</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Members</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {competition.registrations.map((r) => {
                  const members = parseMembers(r.members);
                  return (
                    <tr key={r.id} className="border-b border-charcoal/8 last:border-0">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-charcoal">{r.teamName}</div>
                        <div className="text-xs text-inkSoft">{r.createdAt.toLocaleDateString("en-IN")}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-charcoal">{r.user.name}</div>
                        <div className="text-xs text-inkSoft">{r.user.email}</div>
                        <div className="text-xs text-inkSoft">{r.user.college}</div>
                      </td>
                      <td className="px-5 py-4">
                        <ul className="text-inkSoft text-xs space-y-1">
                          {members.map((m, i) => (
                            <li key={i}>{m.name} — {m.college}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {r.submissions.length === 0 ? (
                            <span className="text-inkSoft text-xs">No submissions</span>
                          ) : (
                            r.submissions.map((s) => (
                              <div key={s.id} className="flex items-center gap-2 text-xs">
                                <span className="text-charcoal">Round {s.roundIdx + 1}</span>
                                {s.link && (
                                  <a href={s.link} target="_blank" rel="noreferrer" className="text-orange hover:underline">Link</a>
                                )}
                                {s.filePath && (
                                  <a href={`/api/submissions/${s.id}/download`} className="text-orange hover:underline">Download</a>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
