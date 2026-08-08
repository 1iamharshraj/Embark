import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { competitionStatus, statusBadgeClass } from "@/lib/competition";

export default async function AdminCompetitionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/account");

  const raw = await prisma.competition.findMany({
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  const competitions = raw.map((c) => ({
    ...c,
    status: competitionStatus(c),
    regCount: (c._count?.registrations ?? 0) + c.seedRegs,
  }));

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
                ← Back to admin
              </Link>
              <Eyebrow>Competitions</Eyebrow>
              <h1 className="font-display font-bold text-3xl text-charcoal mt-2">Manage competitions</h1>
            </div>
            <Button href="/admin/competitions/new">Create competition</Button>
          </div>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">ID / Title</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Registrations</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Dates</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((c) => (
                  <tr key={c.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-charcoal">{c.title}</div>
                      <div className="text-inkSoft text-xs">{c.id}</div>
                      {c.draft && <span className="text-xs text-orangeDeep font-medium">Draft</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${statusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-charcoal">{c.regCount}</td>
                    <td className="px-5 py-4 text-inkSoft">
                      <div>Reg: {c.regOpen.toLocaleDateString("en-IN")} – {c.regClose.toLocaleDateString("en-IN")}</div>
                      <div>Comp: {c.startAt.toLocaleDateString("en-IN")} – {c.endAt.toLocaleDateString("en-IN")}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/competitions/${c.id}/edit`} className="text-xs font-semibold text-orange hover:underline">Edit</Link>
                        <Link href={`/competition/${c.id}`} className="text-xs font-semibold text-inkSoft hover:underline">View</Link>
                        <Link href={`/admin/competitions/${c.id}/registrations`} className="text-xs font-semibold text-inkSoft hover:underline">Registrations</Link>
                        <Link href={`/admin/competitions/${c.id}/progress`} className="text-xs font-semibold text-inkSoft hover:underline">Progress</Link>
                        <Link href={`/admin/competitions/${c.id}/results`} className="text-xs font-semibold text-inkSoft hover:underline">Results</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {competitions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-inkSoft">
                      No competitions yet. Create one to get started.
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
