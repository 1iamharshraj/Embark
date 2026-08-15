"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { FadeIn, StaggerContainer, StaggerItem, SkeletonPulse } from "@/components/motion";
import EmptyState from "@/components/illustrations/EmptyState";

interface Expert {
  id: string;
  user: { name: string; image: string | null };
  headline: string | null;
  bio: string | null;
  location: string | null;
  expertise: string[];
  rating: number;
  reviewCount: number;
  sessionsCompleted: number;
  services: { id: string; name: string; durationMinutes: number | null; price: number; priceDisplay: string }[];
}

export default function ExpertsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchExperts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        params.set("page", String(page));
        const res = await fetch(`/api/v1/experts/search?${params.toString()}`);
        const json = await res.json();
        if (res.ok) {
          setExperts(json.experts || []);
          setTotalPages(json.pagination?.pages || 1);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchExperts();
  }, [q, category, page]);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <FadeIn direction="up" className="mb-8">
            <Eyebrow>Find an expert</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Book 1:1 sessions with verified experts
            </h1>
            <p className="text-inkSoft max-w-2xl">
              Filter by category, search by expertise, and book sessions with alumni and industry professionals.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-4 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, role, or expertise"
                  className="flex-1 rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Category"
                  className="sm:w-64 rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
              </div>
            </div>
          </FadeIn>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <SkeletonPulse className="h-14 w-14 rounded-full mb-4" />
                  <SkeletonPulse className="h-5 w-2/3 rounded mb-2" />
                  <SkeletonPulse className="h-4 w-1/2 rounded mb-4" />
                  <SkeletonPulse className="h-4 w-full rounded" />
                </div>
              ))}
            </div>
          ) : experts.length === 0 ? (
            <FadeIn>
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <EmptyState label="No experts found. Try a different search." />
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.06}>
              {experts.map((expert) => (
                <StaggerItem key={expert.id}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(22,22,22,0.08)" }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                  >
                    <Link
                      href={`/expert/${expert.id}`}
                      className="group block bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 hover:shadow-lg transition h-full"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          className="w-14 h-14 rounded-full bg-cream overflow-hidden flex items-center justify-center border border-charcoal/8 flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {expert.user.image ? (
                            <Image src={expert.user.image} alt={expert.user.name} fill className="object-cover" sizes="56px" />
                          ) : (
                            <span className="text-xl text-inkSoft">{expert.user.name.charAt(0)}</span>
                          )}
                        </motion.div>
                        <div>
                          <h2 className="font-display font-semibold text-lg text-charcoal group-hover:text-orangeDeep transition">
                            {expert.user.name}
                          </h2>
                          <p className="text-sm text-inkSoft line-clamp-1">{expert.headline}</p>
                        </div>
                      </div>

                      {expert.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {expert.expertise.slice(0, 4).map((item) => (
                            <span
                              key={item}
                              className="text-xs bg-cream text-charcoal rounded-full px-2.5 py-1 border border-charcoal/8"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm mt-auto">
                        <span className="text-inkSoft">
                          {expert.rating > 0 ? `${expert.rating.toFixed(1)} ★` : "New"}
                        </span>
                        <span className="font-semibold text-orangeDeep">
                          {expert.services.length > 0 ? `From ₹${expert.services[0].priceDisplay}` : "Book now"}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {totalPages > 1 && (
            <FadeIn className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full font-semibold transition ${
                    page === p
                      ? "bg-orangeDeep text-white"
                      : "bg-white text-charcoal hover:bg-cream"
                  }`}
                >
                  {p}
                </button>
              ))}
            </FadeIn>
          )}
        </div>
      </Container>
    </section>
  );
}
