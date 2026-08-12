import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { hackathonStatus, displayStatus, statusBadgeClass } from "@/lib/hackathon";

export const metadata: Metadata = {
  title: "Hackathons & Case Competitions — Embark India",
  description:
    "Live and upcoming MBA case competitions and hackathons. Register solo or as a team, submit solutions, and track results.",
};

const bannerGradients: Record<string, string> = {
  orange: "linear-gradient(150deg,#5B8CFF,#2E6BFF)",
  green: "linear-gradient(180deg,#16345C,#08172B)",
  dark: "linear-gradient(180deg,#2A2A2A,#101010)",
  charcoal: "linear-gradient(180deg,#101010,#2E6BFF)",
};

export const dynamic = "force-dynamic";

export default async function HackathonsPage() {
  const hackathons = await prisma.hackathon.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    include: {
      timelines: { orderBy: { startsAt: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 lg:py-24">
        <svg
          className="absolute -top-32 -right-32 w-80 opacity-90 pointer-events-none"
          viewBox="0 0 330 300"
          aria-hidden="true"
        >
          <path
            fill="#2E6BFF"
            d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z"
          />
        </svg>
        <Container>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Eyebrow className="justify-center">Hackathons</Eyebrow>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
              Compete in MBA case challenges built for
              <span className="text-orange"> real career outcomes</span>.
            </h1>
            <p className="text-lg text-inkSoft max-w-2xl mx-auto mb-8">
              Explore live and upcoming hackathons designed for MBA students to solve business problems, sharpen thinking, and strengthen placement readiness.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="#hackathons">Explore hackathons</Button>
              <Button href="/mentorship" variant="ghost">
                Get coaching
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="hackathons" className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-2xl mb-10">
            <Eyebrow>Live & upcoming</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Hackathons open now.
            </h2>
            <p className="text-inkSoft">
              Register solo or as a team. Each card shows the fee, status, and category upfront.
            </p>
          </div>
          {hackathons.length === 0 ? (
            <div className="text-center py-12 bg-cream rounded-2xl">
              <p className="text-inkSoft">No hackathons open right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((h) => {
                const status = hackathonStatus(h);
                return (
                  <Link
                    key={h.id}
                    href={`/hackathon/${h.slug}`}
                    className="group relative block rounded-2xl overflow-hidden shadow-[0_10px_26px_rgba(22,22,22,0.14)] hover:shadow-[0_16px_38px_rgba(22,22,22,0.22)] transition bg-white"
                  >
                    <div
                      className="h-48 flex items-end p-5"
                      style={{ background: bannerGradients[h.banner || "orange"] || bannerGradients.orange }}
                    >
                      <div>
                        <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/20 text-white rounded-full px-3 py-1 mb-2">
                          {h.category}
                        </span>
                        <h3 className="font-display font-bold text-xl text-white leading-tight">{h.title}</h3>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="text-sm text-inkSoft">
                        <span>{h.fee > 0 ? `Fee: ₹${h.fee}` : "Free"}</span>
                        <span className="ml-3 text-charcoal font-medium">{h._count.registrations} registered</span>
                      </div>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${statusBadgeClass(
                          status
                        )}`}
                      >
                        {displayStatus(h)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
