"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { FadeIn, StaggerContainer, StaggerItem, SkeletonPulse } from "@/components/motion";
import EmptyState from "@/components/illustrations/EmptyState";

interface Expert {
  id: string;
  slug: string;
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

interface Filters {
  q: string;
  category: string;
  bSchool: string;
  graduationYear: string;
  company: string;
  industry: string;
  function: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  availability: boolean;
  verified: boolean;
  sort: string;
}

const CATEGORIES = [
  "All categories",
  "Consulting",
  "Finance",
  "Product",
  "Marketing",
  "Strategy",
  "Operations",
  "HR",
  "Entrepreneurship",
  "Analytics",
  "Sales",
  "General Management",
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const emptyFilters: Filters = {
  q: "",
  category: "",
  bSchool: "",
  graduationYear: "",
  company: "",
  industry: "",
  function: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  availability: false,
  verified: true,
  sort: "recommended",
};

function isEmptyFilterValue(key: keyof Filters, value: string | boolean): boolean {
  if (key === "verified") return value === true;
  if (key === "availability") return value === false;
  return value === "";
}

export default function ExpertsPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [studentContext, setStudentContext] = useState({
    college: "",
    industry: "",
    role: "",
    goals: "",
  });

  useEffect(() => {
    async function loadStudentContext() {
      try {
        const res = await fetch("/api/v1/students/profile");
        if (res.ok) {
          const json = await res.json();
          const profile = json.profile;
          if (profile) {
            setStudentContext({
              college: profile.college || "",
              industry: profile.targetIndustry || "",
              role: profile.targetRoles?.[0] || "",
              goals: [...(profile.targetRoles || []), ...(profile.skills || []), ...(profile.interests || [])].join(", "),
            });
          }
        }
      } catch {
        // Ignore: public page works without student context.
      }
    }
    loadStudentContext();
  }, []);

  useEffect(() => {
    async function fetchExperts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.q) params.set("q", filters.q);
        if (filters.category) params.set("category", filters.category);
        if (filters.bSchool) params.set("bSchool", filters.bSchool);
        if (filters.graduationYear) params.set("graduationYear", filters.graduationYear);
        if (filters.company) params.set("company", filters.company);
        if (filters.industry) params.set("industry", filters.industry);
        if (filters.function) params.set("function", filters.function);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.minRating) params.set("minRating", filters.minRating);
        if (filters.availability) params.set("availability", "true");
        params.set("verified", String(filters.verified));
        if (filters.sort) params.set("sort", filters.sort);
        if (studentContext.college) params.set("studentCollege", studentContext.college);
        if (studentContext.industry) params.set("studentIndustry", studentContext.industry);
        if (studentContext.role) params.set("studentRole", studentContext.role);
        if (studentContext.goals) params.set("studentGoals", studentContext.goals);
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
  }, [filters, page, studentContext]);

  const activeFilterEntries = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) => !isEmptyFilterValue(key as keyof Filters, value)) as [
        keyof Filters,
        string | boolean,
      ][],
    [filters]
  );

  function updateFilter(key: keyof Filters, value: string | boolean) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setPage(1);
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-7xl mx-auto">
          <FadeIn direction="up" className="mb-8">
            <Eyebrow>Find an expert</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
              Book 1:1 sessions with verified experts
            </h1>
            <p className="text-inkSoft max-w-2xl">
              Search by name, company, role or expertise. Filter by B-school, industry, function, price, rating and
              availability.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-4 sm:p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => updateFilter("q", e.target.value)}
                  placeholder="Search by name, role, company or expertise"
                  className="flex-1 rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className="lg:w-56 rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c === "All categories" ? "" : c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="lg:w-56 rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-charcoal/8">
                <input
                  type="text"
                  value={filters.bSchool}
                  onChange={(e) => updateFilter("bSchool", e.target.value)}
                  placeholder="B-school"
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <input
                  type="text"
                  value={filters.company}
                  onChange={(e) => updateFilter("company", e.target.value)}
                  placeholder="Company"
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <input
                  type="text"
                  value={filters.industry}
                  onChange={(e) => updateFilter("industry", e.target.value)}
                  placeholder="Industry"
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <input
                  type="text"
                  value={filters.function}
                  onChange={(e) => updateFilter("function", e.target.value)}
                  placeholder="Function"
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <input
                  type="number"
                  value={filters.graduationYear}
                  onChange={(e) => updateFilter("graduationYear", e.target.value)}
                  placeholder="Graduation year"
                  min={1950}
                  max={2050}
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  placeholder="Min price (₹)"
                  min={0}
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  placeholder="Max price (₹)"
                  min={0}
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                />
                <select
                  value={filters.minRating}
                  onChange={(e) => updateFilter("minRating", e.target.value)}
                  className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                >
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="3">3+ stars</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <label className="inline-flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availability}
                    onChange={(e) => updateFilter("availability", e.target.checked)}
                    className="w-4 h-4 accent-orangeDeep"
                  />
                  Available now
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => updateFilter("verified", e.target.checked)}
                    className="w-4 h-4 accent-orangeDeep"
                  />
                  Verified only
                </label>
                {activeFilterEntries.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset filters
                  </Button>
                )}
              </div>
            </div>
          </FadeIn>

          {activeFilterEntries.length > 0 && (
            <FadeIn className="flex flex-wrap gap-2 mb-6">
              {activeFilterEntries.map(([key, value]) => {
                if (key === "verified" || key === "availability") return null;
                let label = `${key}: ${value}`;
                if (key === "minPrice" || key === "maxPrice") label = `${key === "minPrice" ? "Min" : "Max"} price: ₹${value}`;
                if (key === "minRating") label = `${value}+ stars`;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-white text-charcoal rounded-full px-3 py-1 border border-charcoal/8"
                  >
                    {label}
                    <button
                      onClick={() => updateFilter(key, "")}
                      className="ml-1 text-inkSoft hover:text-charcoal"
                      aria-label={`Remove ${key} filter`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </FadeIn>
          )}

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
                <EmptyState label="No experts found. Try adjusting your search or filters." />
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
                      href={`/expert/${expert.slug}`}
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
                    page === p ? "bg-orangeDeep text-white" : "bg-white text-charcoal hover:bg-cream"
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
