"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import PlaybookCard from "@/components/PlaybookCard";
import RazorpayButton from "@/components/RazorpayButton";
import { useSession } from "next-auth/react";

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

type ShopFilter = "all" | "interview" | "case";
type ShopSort = "popular" | "price-asc" | "price-desc" | "rating";

export default function PlaybooksPageClient({
  streamPlaybooks,
  shopPlaybooks,
}: PlaybooksPageClientProps) {
  const { data: session } = useSession();
  const [access, setAccess] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<ShopFilter>("all");
  const [sort, setSort] = useState<ShopSort>("popular");
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

  const filteredShop = useMemo(() => {
    let list = shopPlaybooks;
    if (filter !== "all") {
      list = list.filter((p) => p.category === filter);
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        // "popular" preserves DB order.
        break;
    }
    return list;
  }, [shopPlaybooks, filter, sort]);

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
            <Eyebrow className="justify-center">Playbooks</Eyebrow>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight mb-5">
              Pick your stream.
              <br />
              <span className="text-orange">Or sharpen a skill.</span>
            </h1>
            <p className="text-lg text-inkSoft max-w-2xl mx-auto mb-8">
              Stream playbooks give you the full map. Shop playbooks are focused prep guides for interviews and cases.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#shelf"
                className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] bg-orangeDeep text-white shadow-[0_6px_18px_rgba(29,78,216,0.28)] hover:bg-[#1740A8] px-7 py-3.5 text-base min-h-[48px]"
              >
                Browse the shelf
              </a>
              <a
                href="#shop"
                className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] bg-white text-charcoal border border-charcoal/20 hover:bg-cream px-7 py-3.5 text-base min-h-[48px]"
              >
                Visit the shop
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
            {streamPlaybooks.map((p, i) => (
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
                hasAccess
                actionLabel="Read playbook"
              />
            ))}
          </div>
        </Container>
      </section>

      <section id="shop" className="bg-cream py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <Eyebrow>The shop</Eyebrow>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-4">
                Focused prep playbooks.
              </h2>
              <p className="text-inkSoft">
                Interview and case-study guides you can buy once and keep. Filter by category and sort to find what you need.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex rounded-xl bg-white border border-charcoal/10 p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "interview", label: "Interview" },
                  { key: "case", label: "Case" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as ShopFilter)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      filter === tab.key
                        ? "bg-orangeDeep text-white"
                        : "text-inkSoft hover:text-charcoal"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ShopSort)}
                className="rounded-xl bg-white border border-charcoal/10 px-4 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30"
              >
                <option value="popular">Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShop.map((p, i) => {
              const hasAccess = access[p.slug] || false;
              return (
                <PlaybookCard
                  key={p.id}
                  slug={p.slug}
                  title={p.name}
                  tag={p.category}
                  meta={p.meta}
                  rating={p.rating}
                  price={p.price}
                  intro={p.oneLiner}
                  coverIndex={i + streamPlaybooks.length}
                  href={hasAccess ? `/playbook/${p.slug}` : undefined}
                  hasAccess={hasAccess}
                  actionLabel={hasAccess ? "Read playbook" : undefined}
                  onBuy={
                    hasAccess
                      ? undefined
                      : () => {
                          // Handled by RazorpayButton rendered inside the card when hasAccess is false.
                        }
                  }
                  buyButton={
                    hasAccess ? undefined : (
                      <RazorpayButton
                        playbook={{ slug: p.slug, name: p.name, price: p.price }}
                        label={`Buy for ₹${p.price}`}
                        size="sm"
                        onSuccess={() => setRefreshKey((k) => k + 1)}
                      />
                    )
                  }
                />
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
