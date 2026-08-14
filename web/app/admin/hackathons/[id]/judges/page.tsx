import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import ClientDate from "@/components/ClientDate";
import AddJudgeForm from "./_components/AddJudgeForm";

export default async function AdminHackathonJudgesPage({ params }: { params: { id: string } }) {
  await checkPagePermission("hackathon.view");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: params.id },
    include: {
      judges: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!hackathon) notFound();

  return (
    <>
      <AdminHeader
        eyebrow="Judges"
        title={hackathon.title}
        description="Add judges and assign them to submissions."
        backHref={`/admin/hackathons/${params.id}/edit`}
        backLabel="Back to edit hackathon"
      />

      <AddJudgeForm hackathonId={hackathon.id} />

      <div className="mt-8">
        <AdminDataTable
          title="Judges"
          count={hackathon.judges.length}
          empty={hackathon.judges.length === 0 && <div className="p-8 text-center text-inkSoft">No judges yet.</div>}
        >
          {hackathon.judges.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Name</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Email</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {hackathon.judges.map((j) => (
                  <tr key={j.id} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4 font-semibold text-charcoal">{j.user.name}</td>
                    <td className="px-5 py-4 text-inkSoft">{j.user.email}</td>
                    <td className="px-5 py-4 text-inkSoft">
                      <ClientDate date={j.createdAt} options={{ dateStyle: "medium" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AdminDataTable>
      </div>
    </>
  );
}
