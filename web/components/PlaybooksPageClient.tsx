"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PlaybookShelf from "@/components/PlaybookShelf";
import DomainMarquee from "@/components/DomainMarquee";
import PlaybookCategories from "@/components/PlaybookCategories";
import ShopGrid from "@/components/ShopGrid";
import WhyStudentsNeed from "@/components/WhyStudentsNeed";
import WhyEmbarkPlaybooks from "@/components/WhyEmbarkPlaybooks";
import TestimonialCarousel from "@/components/TestimonialCarousel";

interface PlaybookSummary {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  oneLiner: string;
  meta: string;
  price: number;
  rating: number;
}

interface PlaybooksPageClientProps {
  streamPlaybooks: PlaybookSummary[];
  shopPlaybooks: PlaybookSummary[];
}

export default function PlaybooksPageClient({
  streamPlaybooks,
  shopPlaybooks,
}: PlaybooksPageClientProps) {
  const { data: session } = useSession();
  const [access, setAccess] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/playbooks/access")
      .then((r) => r.json())
      .then((data: { access?: Record<string, boolean> }) => {
        if (data.access) setAccess(data.access);
      })
      .catch((e) => console.error("Failed to load access map", e));
  }, [session, refreshKey]);

  const shelfStreams = streamPlaybooks.map((p) => ({
    slug: p.slug,
    name: p.name,
    soon: false,
  }));

  return (
    <>
      <PlaybookShelf streams={shelfStreams} />
      <DomainMarquee />
      <PlaybookCategories />
      <ShopGrid
        shopPlaybooks={shopPlaybooks}
        access={access}
        onAccessChange={() => setRefreshKey((k) => k + 1)}
      />
      <WhyStudentsNeed />
      <WhyEmbarkPlaybooks />
      <TestimonialCarousel />
    </>
  );
}
