import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
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
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Button href={`/admin/hackathons/${params.id}/edit`} variant="ghost" size="sm">
            ← Back to edit hackathon
          </Button>
          <Eyebrow className="mt-4">Judges</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Add judges and assign them to submissions.</p>

          <AddJudgeForm hackathonId={hackathon.id} />

          <div className="mt-8 bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            {hackathon.judges.length === 0 ? (
              <p className="p-6 text-inkSoft">No judges yet.</p>
            ) : (
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
                      <td className="px-5 py-4 text-inkSoft">{new Date(j.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
