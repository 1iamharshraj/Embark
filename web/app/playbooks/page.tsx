import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PlaybooksPageClient from "@/components/PlaybooksPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playbooks — Embark India",
  description:
    "One playbook per MBA stream — roles, recruiters, term-by-term gameplans and skill checklists. Pick your book off the shelf.",
};

export default async function PlaybooksPage() {
  const streamPlaybooks = await prisma.playbook.findMany({
    where: { category: "stream" },
    orderBy: { order: "asc" },
  });

  const shopPlaybooks = await prisma.playbook.findMany({
    where: { category: { in: ["interview", "case"] } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <PlaybooksPageClient
      streamPlaybooks={streamPlaybooks.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        tagline: p.tagline,
        oneLiner: p.oneLiner,
        meta: p.meta,
        price: p.price,
        rating: p.rating,
      }))}
      shopPlaybooks={shopPlaybooks.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        tagline: p.tagline,
        oneLiner: p.oneLiner,
        meta: p.meta,
        price: p.price,
        rating: p.rating,
      }))}
    />
  );
}
