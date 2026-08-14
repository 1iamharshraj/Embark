import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

export const dynamic = "force-dynamic";

function formatCurrency(n: number | null) {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatLakhs(n: number | null) {
  if (n == null) return "—";
  return `₹${(n / 100000).toFixed(1)}L`;
}

function list(arr: string[] | null) {
  if (!arr || arr.length === 0) return "—";
  return arr.join(", ");
}

export default async function ComparePage({ searchParams }: { searchParams?: { ids?: string } }) {
  const rawIds = searchParams?.ids;
  if (!rawIds) {
    redirect("/mba-colleges-tamilnadu");
  }

  const ids = rawIds.split(",").filter(Boolean).slice(0, 3);
  if (ids.length === 0) redirect("/mba-colleges-tamilnadu");

  const colleges = await prisma.mbaCollege.findMany({
    where: { id: { in: ids }, isActive: true },
  });

  if (colleges.length === 0) notFound();

  // Preserve the order from the query string.
  const order = new Map(ids.map((id, i) => [id, i]));
  const sorted = [...colleges].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  const rows = [
    { label: "City", value: (c: typeof sorted[0]) => c.city },
    { label: "Established", value: (c: typeof sorted[0]) => c.establishedYear ?? "—" },
    { label: "Affiliation", value: (c: typeof sorted[0]) => c.affiliation ?? "—" },
    { label: "Accreditation", value: (c: typeof sorted[0]) => c.accreditation ?? "—" },
    { label: "Campus type", value: (c: typeof sorted[0]) => c.campusType ?? "—" },
    { label: "Fees per year", value: (c: typeof sorted[0]) => (c.feesMin && c.feesMax ? `${formatCurrency(c.feesMin)} – ${formatCurrency(c.feesMax)}` : formatCurrency(c.feesMax ?? c.feesMin)) },
    { label: "Average package", value: (c: typeof sorted[0]) => formatLakhs(c.avgPackage) },
    { label: "Highest package", value: (c: typeof sorted[0]) => formatLakhs(c.highestPackage) },
    { label: "Specializations", value: (c: typeof sorted[0]) => list(c.specializations) },
    { label: "Entrance exams", value: (c: typeof sorted[0]) => list(c.entranceExams) },
    { label: "Facilities", value: (c: typeof sorted[0]) => list(c.facilities) },
    { label: "Phone", value: (c: typeof sorted[0]) => c.phone ?? "—" },
    { label: "Email", value: (c: typeof sorted[0]) => c.email ?? "—" },
    { label: "Address", value: (c: typeof sorted[0]) => c.address ?? "—" },
  ];

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href="/mba-colleges-tamilnadu"
              className="text-sm font-semibold text-orangeDeep hover:underline mb-4 inline-block"
            >
              ← Back to search
            </Link>
            <Eyebrow>Compare</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2">
              Compare MBA colleges
            </h1>
            <p className="text-inkSoft mt-2 max-w-2xl">
              Side-by-side comparison of the colleges you selected.
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-4 sticky left-0 bg-cream z-10 min-w-[160px]">
                    Feature
                  </th>
                  {sorted.map((college) => (
                    <th
                      key={college.id}
                      className="text-left font-semibold text-charcoal px-5 py-4 min-w-[220px]"
                    >
                      <div className="font-display font-bold text-base">
                        {college.name}
                      </div>
                      {college.shortName && (
                        <div className="text-xs text-inkSoft font-normal">{college.shortName}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-charcoal/8 last:border-0">
                    <td className="px-5 py-4 font-semibold text-charcoal sticky left-0 bg-white z-10">
                      {row.label}
                    </td>
                    {sorted.map((college) => (
                      <td key={college.id} className="px-5 py-4 text-inkSoft align-top">
                        {row.value(college)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-5 py-4 font-semibold text-charcoal sticky left-0 bg-white z-10">
                    Website
                  </td>
                  {sorted.map((college) => (
                    <td key={college.id} className="px-5 py-4 align-top">
                      {college.website ? (
                        <Link
                          href={college.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orangeDeep font-semibold hover:underline"
                        >
                          Visit site
                        </Link>
                      ) : (
                        <span className="text-inkSoft">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/mba-colleges-tamilnadu">Change selection</Button>
            <Link
              href="/mba-colleges-tamilnadu"
              className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal border border-charcoal/15 px-6 py-3 hover:bg-orange/10 transition"
            >
              Back to all colleges
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
