import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PlaybookDetailClient from "@/components/PlaybookDetailClient";
import type { PlaybookContent } from "@/components/PlaybookDetailClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const playbook = await prisma.playbook.findUnique({
    where: { slug: params.slug },
    select: { name: true, oneLiner: true },
  });
  return {
    title: playbook ? `${playbook.name} Playbook — Embark India` : "Playbook — Embark India",
    description: playbook?.oneLiner || "An MBA playbook from Embark India.",
  };
}

export default async function PlaybookDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const playbook = await prisma.playbook.findUnique({
    where: { slug: params.slug },
  });

  if (!playbook) {
    notFound();
  }

  const content = playbook.content as unknown as PlaybookContent;

  return (
    <PlaybookDetailClient
      playbook={{
        id: playbook.id,
        slug: playbook.slug,
        name: playbook.name,
        category: playbook.category,
        theme: playbook.theme,
        price: playbook.price,
        rating: playbook.rating,
        meta: playbook.meta,
        content,
      }}
    />
  );
}
