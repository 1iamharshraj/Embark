import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import ClientDate from "@/components/ClientDate";
import { parseMembers } from "@/lib/competition";

export default async function RegistrationsPage({ params }: { params: { id: string } }) {
  await checkPagePermission("competition.view");

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

  const count = competition.registrations.length;

  return (
    <>
      <AdminHeader
        eyebrow="Registrations"
        title={competition.title}
        description={`${count} registration${count === 1 ? "" : "s"}`}
        backHref="/admin/competitions"
      />

      <AdminDataTable
        title="All registrations"
        description="Teams, leads and submitted materials for this competition."
        count={count}
        empty={count === 0 && <div className="p-8 text-center text-inkSoft">No registrations yet.</div>}
      >
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
                    <div className="text-xs text-inkSoft">
                      <ClientDate date={r.createdAt} options={{ dateStyle: "medium" }} />
                    </div>
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
      </AdminDataTable>
    </>
  );
}
