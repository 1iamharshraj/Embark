import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { CollegeSearchClient } from "./_components/CollegeSearchClient";

export const metadata: Metadata = {
  title: "MBA Colleges in Tamil Nadu — Search & Compare",
  description:
    "Search and compare top MBA colleges in Tamil Nadu. Filter by city, fees, specializations, accreditation and entrance exams.",
};

export const dynamic = "force-dynamic";

export default async function MbaCollegesTamilNaduPage() {
  const [colleges, filters] = await Promise.all([
    prisma.mbaCollege.findMany({
      where: { isActive: true, state: "Tamil Nadu" },
      orderBy: [{ rankState: "asc" }, { name: "asc" }],
    }),
    prisma.mbaCollege.findMany({
      where: { isActive: true, state: "Tamil Nadu" },
      select: { city: true, specializations: true, accreditation: true, entranceExams: true },
    }),
  ]);

  const cities = Array.from(new Set(filters.map((c) => c.city))).sort();
  const specializations = Array.from(new Set(filters.flatMap((c) => c.specializations))).sort();
  const accreditations = Array.from(new Set(filters.map((c) => c.accreditation).filter(Boolean) as string[])).sort();
  const entranceExams = Array.from(new Set(filters.flatMap((c) => c.entranceExams))).sort();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <Eyebrow>MBA in Tamil Nadu</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal mt-2">
              Find & compare MBA colleges
            </h1>
            <p className="text-inkSoft mt-3 max-w-2xl text-lg">
              Explore colleges across Tamil Nadu. Filter by city, fees, specializations and accreditation, then compare up to three side-by-side.
            </p>
          </div>

          <CollegeSearchClient
            initialColleges={colleges}
            filters={{ cities, specializations, accreditations, entranceExams }}
          />
        </div>
      </Container>
    </section>
  );
}
