"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SHOP_PLAYBOOKS, SHOP_COVERS } from "@/lib/shopPlaybooksStatic";
import RazorpayButton from "@/components/RazorpayButton";

interface ShopPlaybookSummary {
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

interface ShopGridProps {
  shopPlaybooks: ShopPlaybookSummary[];
  access: Record<string, boolean>;
  onAccessChange?: () => void;
}

type ShopFilter = "all" | "interview" | "case";
type ShopSort = "popular" | "price-asc" | "price-desc" | "rating";

interface DisplayPlaybook {
  id?: string;
  slug: string;
  title: string;
  category: "interview" | "case";
  tag: string;
  meta: string;
  rating: number;
  price: number;
  intro: string;
  bullets: string[];
  note?: string;
  hasAccess: boolean;
  isDb: boolean;
  coverIndex: number;
}

function formatPrice(n: number) {
  return `₹${n}`;
}

export default function ShopGrid({ shopPlaybooks, access, onAccessChange }: ShopGridProps) {
  const [filter, setFilter] = useState<ShopFilter>("all");
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<ShopSort>("popular");
  const [openMenu, setOpenMenu] = useState<"interview" | "case" | null>(null);
  const [selected, setSelected] = useState<DisplayPlaybook | null>(null);
  const [payMethod, setPayMethod] = useState<"card" | "upi">("card");
  const menuRef = useRef<HTMLDivElement>(null);

  // close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelected(null);
        setOpenMenu(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const merged = useMemo(() => {
    const map = new Map<string, DisplayPlaybook>();
    SHOP_PLAYBOOKS.forEach((p, i) => {
      map.set(p.slug, {
        slug: p.slug,
        title: p.title,
        category: p.category,
        tag: p.tag,
        meta: p.meta,
        rating: p.rating,
        price: p.price,
        intro: p.intro,
        bullets: p.bullets,
        note: p.note,
        hasAccess: !!access[p.slug],
        isDb: false,
        coverIndex: i,
      });
    });
    shopPlaybooks.forEach((p, i) => {
      const existing = map.get(p.slug);
      map.set(p.slug, {
        id: p.id,
        slug: p.slug,
        title: p.name.replace(/\splaybook$/i, ""),
        category: (p.category === "interview" || p.category === "case" ? p.category : "interview") as DisplayPlaybook["category"],
        tag: p.category === "case" ? "Case" : "Interview",
        meta: p.meta,
        rating: p.rating,
        price: p.price,
        intro: p.oneLiner || p.tagline,
        bullets: existing?.bullets ?? [p.oneLiner || p.tagline],
        note: existing?.note,
        hasAccess: !!access[p.slug],
        isDb: true,
        coverIndex: existing?.coverIndex ?? (i + SHOP_PLAYBOOKS.length),
      });
    });
    return Array.from(map.values());
  }, [shopPlaybooks, access]);

  const filtered = useMemo(() => {
    let list = merged;
    if (subFilter) {
      list = list.filter((p) => p.slug === subFilter);
    } else if (filter !== "all") {
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
        break;
    }
    return list;
  }, [merged, filter, subFilter, sort]);

  function selectCategory(cat: ShopFilter) {
    setFilter(cat);
    setSubFilter(null);
  }

  function toggleMenu(menu: "interview" | "case") {
    setOpenMenu((prev) => (prev === menu ? null : menu));
    setFilter(menu);
    setSubFilter(null);
  }

  function selectSub(menu: "interview" | "case", slug: string | "") {
    if (slug === "") {
      setFilter(menu);
      setSubFilter(null);
    } else {
      setFilter(menu);
      setSubFilter(slug);
    }
    setOpenMenu(null);
  }

  const interviewItems = merged.filter((p) => p.category === "interview");
  const caseItems = merged.filter((p) => p.category === "case");

  return (
    <section className="shop" id="explore-playbooks" aria-label="Explore all playbooks">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="shop-head">
          <div>
            <p className="eyebrow">The library</p>
            <h2>
              Explore <span>all playbooks</span>.
            </h2>
            <p>Find the right playbook for your interview preparation.</p>
          </div>
        </div>

        <div className="shop-tools" ref={menuRef}>
          <div className="shop-tabs" role="tablist" aria-label="Filter playbooks">
            <button
              className="shop-tab"
              role="tab"
              aria-selected={filter === "all" && !subFilter}
              onClick={() => {
                selectCategory("all");
                setOpenMenu(null);
              }}
            >
              All
            </button>
            <div className="shop-tabwrap">
              <button
                className="shop-tab"
                role="tab"
                aria-selected={filter === "interview"}
                aria-haspopup="true"
                aria-expanded={openMenu === "interview"}
                onClick={() => toggleMenu("interview")}
              >
                Interview playbooks{" "}
                <span className="shop-caret" aria-hidden="true">
                  ▾
                </span>
              </button>
              <div className="shop-menu" role="menu" hidden={openMenu !== "interview"}>
                <button
                  role="menuitem"
                  aria-current={filter === "interview" && !subFilter}
                  onClick={() => selectSub("interview", "")}
                >
                  <span>All interview playbooks</span>
                </button>
                {interviewItems.map((p) => (
                  <button
                    key={p.slug}
                    role="menuitem"
                    aria-current={subFilter === p.slug}
                    onClick={() => selectSub("interview", p.slug)}
                  >
                    <span>{p.title}</span>
                    <span className="shop-menu-price">{formatPrice(p.price)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="shop-tabwrap">
              <button
                className="shop-tab"
                role="tab"
                aria-selected={filter === "case"}
                aria-haspopup="true"
                aria-expanded={openMenu === "case"}
                onClick={() => toggleMenu("case")}
              >
                Case playbooks{" "}
                <span className="shop-caret" aria-hidden="true">
                  ▾
                </span>
              </button>
              <div className="shop-menu" role="menu" hidden={openMenu !== "case"}>
                <button
                  role="menuitem"
                  aria-current={filter === "case" && !subFilter}
                  onClick={() => selectSub("case", "")}
                >
                  <span>All case playbooks</span>
                </button>
                {caseItems.map((p) => (
                  <button
                    key={p.slug}
                    role="menuitem"
                    aria-current={subFilter === p.slug}
                    onClick={() => selectSub("case", p.slug)}
                  >
                    <span>{p.title}</span>
                    <span className="shop-menu-price">{formatPrice(p.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="shop-sort">
            <label htmlFor="shopSort">Sort by</label>
            <select
              id="shopSort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ShopSort)}
            >
              <option value="popular">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="shop-grid">
          {filtered.map((p) => (
            <article key={p.slug} className="pb-buy">
              <div
                className="pb-cover"
                style={{ background: SHOP_COVERS[p.coverIndex % SHOP_COVERS.length] }}
              >
                <span className="pb-tag">{p.tag}</span>
                <span className="pb-cover-t">{p.title}</span>
              </div>
              <div className="pb-body">
                <h3>{p.title} Playbook</h3>
                <div className="pb-meta">
                  <span className="pb-star">★ {p.rating.toFixed(1)}</span>
                  <span>{p.meta}</span>
                </div>
                <p className="pb-blurb">{p.intro}</p>
              </div>
              <div className="pb-foot">
                <span className="pb-price">{formatPrice(p.price)}</span>
                {p.hasAccess ? (
                  <Link href={`/playbook/${p.slug}`} className="pb-buybtn">
                    Read now
                  </Link>
                ) : (
                  <button className="pb-buybtn" onClick={() => setSelected(p)}>
                    Buy now
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="pbm open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pbmTitle"
        >
          <div className="pbm-back" onClick={() => setSelected(null)} aria-hidden="true" />
          <div className="pbm-card">
            <button
              className="pbm-close"
              aria-label="Close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <div className="pbm-left">
              <p className="pbm-ey" id="pbmEy">
                {selected.tag} playbook
              </p>
              <h3 id="pbmTitle">{selected.title} Playbook</h3>
              <p className="pbm-intro">{selected.intro}</p>
              <ul className="pbm-list">
                {selected.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              {selected.note && <p className="pbm-note">{selected.note}</p>}
            </div>
            <div className="pbm-right">
              <span className="pbm-demo">Demo · payments not live yet</span>
              <div className="pbm-sum">
                <div>
                  <span>{selected.title} Playbook</span>
                  <small>Lifetime access · instant download</small>
                </div>
                <b>{formatPrice(selected.price)}</b>
              </div>
              <div className="pbm-pay-tabs" role="tablist" aria-label="Payment method">
                <button
                  className="pbm-pay-tab"
                  role="tab"
                  aria-selected={payMethod === "card"}
                  onClick={() => setPayMethod("card")}
                >
                  Card
                </button>
                <button
                  className="pbm-pay-tab"
                  role="tab"
                  aria-selected={payMethod === "upi"}
                  onClick={() => setPayMethod("upi")}
                >
                  UPI
                </button>
              </div>
              {payMethod === "card" ? (
                <div>
                  <div className="pbm-field">
                    <label>Card number</label>
                    <input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" autoComplete="off" />
                  </div>
                  <div className="pbm-field">
                    <label>Name on card</label>
                    <input type="text" placeholder="Your name" autoComplete="off" />
                  </div>
                  <div className="pbm-row">
                    <div className="pbm-field">
                      <label>Expiry</label>
                      <input type="text" placeholder="MM / YY" autoComplete="off" />
                    </div>
                    <div className="pbm-field">
                      <label>CVV</label>
                      <input type="text" inputMode="numeric" placeholder="•••" autoComplete="off" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="pbm-field">
                    <label>UPI ID</label>
                    <input type="text" placeholder="yourname@upi" autoComplete="off" />
                  </div>
                </div>
              )}
              {selected.id ? (
                <RazorpayButton
                  order={{
                    orderType: "PLAYBOOK",
                    relatedId: selected.id,
                    name: `${selected.title} Playbook`,
                    label: `Pay ${formatPrice(selected.price)}`,
                  }}
                  onSuccess={() => {
                    onAccessChange?.();
                    setTimeout(() => setSelected(null), 800);
                  }}
                  className="pbm-paybtn"
                  variant="primary"
                />
              ) : (
                <button className="pbm-paybtn" disabled>
                  Available soon
                </button>
              )}
              <p className="pbm-secure">🔒 Secure checkout — connect Razorpay to accept real payments.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
