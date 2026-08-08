import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import PlaybookCard from "@/components/PlaybookCard";

export const metadata: Metadata = {
  title: "Stream Playbooks — Embark India",
  description:
    "One playbook per MBA stream — roles, recruiters, term-by-term gameplans and skill checklists. Pick your book off the shelf.",
};

export default async function PlaybooksPage() {
  const playbooks = await prisma.playbook.findMany({
    orderBy: { order: "asc" },
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
            <Eyebrow className="justify-center">Stream playbooks</Eyebrow>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
              Pick your MBA stream.
              <br />
              <span className="text-orange">Get the map.</span>
            </h1>
            <p className="text-lg text-inkSoft max-w-2xl mx-auto mb-8">
              One playbook per stream: roles, recruiters, term-by-term gameplans and skill checklists — built for tier-2 MBA students who want to compete better.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#shelf"
                className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] bg-orangeDeep text-white shadow-[0_6px_18px_rgba(29,78,216,0.28)] hover:bg-[#1740A8] px-7 py-3.5 text-base min-h-[48px]"
              >
                Browse the shelf
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section id="shelf" className="bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-2xl mb-10">
            <Eyebrow>The shelf</Eyebrow>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Choose a stream, any stream.
            </h2>
            <p className="text-inkSoft">
              Each playbook is a self-contained guide: what to study, where it leads, who hires, and what to tick before placement season.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playbooks.map((p, i) => (
              <PlaybookCard
                key={p.id}
                slug={p.slug}
                title={p.name}
                tag={p.category}
                meta={p.meta}
                rating={p.rating}
                price={p.price}
                intro={p.oneLiner}
                coverIndex={i}
                href={`/playbook/${p.slug}`}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
