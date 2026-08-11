import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PlaybookDetailClient from "@/components/PlaybookDetailClient";
import type { PlaybookContent } from "@/lib/playbookContent";
import { getStaticPlaybook } from "@/lib/playbookStaticData";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const playbook = await prisma.playbook.findUnique({
    where: { slug: params.slug },
    select: { name: true, oneLiner: true, tagline: true },
  });
  return {
    title: playbook ? `${playbook.name} Playbook — Embark India` : "Playbook — Embark India",
    description: playbook?.oneLiner || playbook?.tagline || "An MBA playbook from Embark India.",
  };
}

function mergeContent(dbContent: unknown, slug: string): PlaybookContent {
  const staticPb = getStaticPlaybook(slug);
  const c = (dbContent ?? {}) as Partial<PlaybookContent>;
  const fallback = staticPb ?? {
    tagline: "",
    oneLiner: "",
    forYouIf: [],
    study: [],
    roles: [],
    recruiters: [],
    skills: [],
    plan: [],
    signals: { do: [], dont: [] },
    colleges: [],
  };
  return {
    tagline: c.tagline || fallback.tagline,
    oneLiner: c.oneLiner || fallback.oneLiner,
    forYouIf: c.forYouIf?.length ? c.forYouIf : fallback.forYouIf,
    study: c.study?.length ? c.study : fallback.study,
    roles: c.roles?.length ? c.roles : fallback.roles,
    recruiters: c.recruiters?.length ? c.recruiters : fallback.recruiters,
    skills: c.skills?.length ? c.skills : fallback.skills,
    plan: c.plan?.length ? c.plan : fallback.plan,
    signals: c.signals?.do?.length || c.signals?.dont?.length
      ? c.signals
      : fallback.signals,
    colleges: c.colleges?.length ? c.colleges : fallback.colleges,
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

  const content = mergeContent(playbook.content, playbook.slug);
  const staticPb = getStaticPlaybook(playbook.slug);
  const theme = playbook.theme || staticPb?.theme || "orange";

  return (
    <PlaybookDetailClient
      playbook={{
        id: playbook.id,
        slug: playbook.slug,
        name: playbook.name,
        category: playbook.category,
        theme,
        price: playbook.price,
        rating: playbook.rating,
        meta: playbook.meta,
        content,
      }}
    />
  );
}
