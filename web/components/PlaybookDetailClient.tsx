"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import RazorpayButton from "@/components/RazorpayButton";

export interface Role {
  role: string;
  desc: string;
  arc: string;
}

export interface PlanPhase {
  phase: string;
  detail: string;
}

export interface Signals {
  do: string[];
  dont: string[];
}

export interface PlaybookContent {
  tagline: string;
  oneLiner: string;
  forYouIf: string[];
  study: string[];
  roles: Role[];
  recruiters: string[];
  skills: string[];
  plan: PlanPhase[];
  signals: Signals;
  colleges: string[];
}

interface PlaybookDetailClientProps {
  playbook: {
    id: string;
    slug: string;
    name: string;
    category: string;
    theme: string;
    price: number;
    rating: number;
    meta: string;
    content: PlaybookContent;
  };
}

const chapters = [
  { id: "fit", label: "Is this you?" },
  { id: "study", label: "What you'll study" },
  { id: "roles", label: "Roles" },
  { id: "recruiters", label: "Recruiters" },
  { id: "plan", label: "2-year gameplan" },
  { id: "skills", label: "Skill checklist" },
  { id: "signals", label: "Do / Don't" },
  { id: "colleges", label: "Colleges" },
];

function heroClass(theme: string) {
  switch (theme) {
    case "dark":
      return "bg-navy text-cream";
    case "green":
      return "bg-green text-cream";
    case "orange":
    default:
      return "bg-cream text-charcoal";
  }
}

function isShopPlaybook(category: string) {
  return category === "interview" || category === "case";
}

export default function PlaybookDetailClient({ playbook }: PlaybookDetailClientProps) {
  const c = playbook.content;
  const { data: session, status: sessionStatus } = useSession();
  const [checked, setChecked] = useState<number[]>([]);
  const [hasAccess, setHasAccess] = useState(!isShopPlaybook(playbook.category) || playbook.price === 0);
  const [accessLoaded, setAccessLoaded] = useState(false);
  const [bought, setBought] = useState(false);

  // Load access for paid shop playbooks.
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!isShopPlaybook(playbook.category) || playbook.price === 0) {
      setAccessLoaded(true);
      return;
    }
    if (session?.user?.isAdmin) {
      setHasAccess(true);
      setAccessLoaded(true);
      return;
    }
    fetch(`/api/playbooks/${playbook.slug}/access`)
      .then((r) => r.json())
      .then((data: { hasAccess?: boolean }) => {
        setHasAccess(data.hasAccess === true);
      })
      .catch((e) => console.error("Failed to load access", e))
      .finally(() => setAccessLoaded(true));
  }, [playbook, session, sessionStatus]);

  // Load progress: authenticated from server, unauthenticated from localStorage.
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!isShopPlaybook(playbook.category)) {
      if (session?.user?.id) {
        fetch(`/api/playbooks/${playbook.slug}/progress`)
          .then((r) => r.json())
          .then((data: { checked?: number[] }) => {
            setChecked(Array.isArray(data.checked) ? data.checked : []);
          })
          .catch((e) => console.error("Failed to load progress", e));
      } else {
        try {
          const raw = localStorage.getItem(`embark-pb-${playbook.slug}`);
          if (raw) {
            const parsed = JSON.parse(raw) as number[];
            setChecked(Array.isArray(parsed) ? parsed : []);
          }
        } catch {
          // ignore localStorage errors
        }
      }
    }
  }, [playbook.slug, playbook.category, session, sessionStatus]);

  // Persist progress: authenticated to server, unauthenticated to localStorage.
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (isShopPlaybook(playbook.category)) return;

    if (session?.user?.id) {
      fetch(`/api/playbooks/${playbook.slug}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked }),
      }).catch((e) => console.error("Failed to save progress", e));
    } else {
      try {
        localStorage.setItem(`embark-pb-${playbook.slug}`, JSON.stringify(checked));
      } catch {
        // ignore
      }
    }
  }, [checked, playbook.slug, playbook.category, session, sessionStatus]);

  const toggle = (i: number) => {
    setChecked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const progress = useMemo(() => {
    if (!c.skills.length) return 0;
    return Math.round((checked.length / c.skills.length) * 100);
  }, [checked, c.skills.length]);

  const previewBullets = c.forYouIf.slice(0, 3);
  const locked = !accessLoaded || (!hasAccess && isShopPlaybook(playbook.category) && playbook.price > 0);

  return (
    <>
      <header className={`py-16 sm:py-20 lg:py-24 ${heroClass(playbook.theme)}`}>
        <Container>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] mb-4 opacity-80">
              <span className="w-8 border-t-2 border-dashed" />
              {playbook.category} playbook
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">
              {playbook.name}
            </h1>
            <p className="text-lg sm:text-xl opacity-80 mb-6">{c.oneLiner || c.tagline}</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <span>
                <span className="font-bold">★ {playbook.rating.toFixed(1)}</span> rating
              </span>
              <span className="opacity-80">{playbook.meta}</span>
            </div>
          </div>
        </Container>
      </header>

      {locked ? (
        <section className="bg-white py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="bg-cream rounded-2xl p-8 sm:p-10">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  Preview
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal mb-4">
                  What&apos;s inside this playbook
                </h2>
                <ul className="grid gap-3 mb-8">
                  {previewBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-charcoal">
                      <svg
                        className="w-5 h-5 text-orange flex-none mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <RazorpayButton
                    playbook={{ slug: playbook.slug, name: playbook.name, price: playbook.price }}
                    label={`Buy for ₹${playbook.price}`}
                    onSuccess={() => {
                      setHasAccess(true);
                      setBought(true);
                    }}
                  />
                  <span className="text-sm text-inkSoft">
                    One-time purchase. Instant access after payment.
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <>
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-charcoal/10 shadow-sm">
            <Container>
              <nav className="flex gap-2 overflow-x-auto py-3 no-scrollbar" aria-label="Chapters">
                {chapters.map((ch) => (
                  <a
                    key={ch.id}
                    href={`#${ch.id}`}
                    className="whitespace-nowrap text-xs sm:text-sm font-medium text-inkSoft hover:text-charcoal px-3 py-1.5 rounded-full hover:bg-cream transition"
                  >
                    {ch.label}
                  </a>
                ))}
              </nav>
            </Container>
          </div>

          <section id="fit" className="bg-cream py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  Is this you?
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-6">
                  This playbook is for you if…
                </h2>
                <ul className="grid gap-4">
                  {c.forYouIf.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-charcoal">
                      <svg
                        className="w-5 h-5 text-orange flex-none mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </section>

          <section id="study" className="bg-white py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  What you&apos;ll study
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
                  The courses that carry this stream.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {c.study.map((s) => (
                  <span
                    key={s}
                    className="text-sm font-medium bg-cream text-charcoal rounded-full px-4 py-2 border border-charcoal/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Container>
          </section>

          <section id="roles" className="bg-cream py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  Where it leads
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
                  The roles, and the five-year arc.
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {c.roles.map((r) => (
                  <div
                    key={r.role}
                    className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]"
                  >
                    <h3 className="font-display font-bold text-lg text-charcoal mb-2">{r.role}</h3>
                    <p className="text-sm text-inkSoft leading-relaxed mb-4">{r.desc}</p>
                    <div className="text-xs font-medium text-orangeDeep bg-orangeSoft rounded-xl px-3 py-2">
                      Arc: {r.arc}
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          <section id="recruiters" className="bg-white py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  Who hires
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
                  Recruiters that own this corridor.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {c.recruiters.map((r) => (
                  <span key={r} className="text-sm font-semibold bg-navy text-white rounded-full px-4 py-2">
                    {r}
                  </span>
                ))}
              </div>
            </Container>
          </section>

          <section id="plan" className="bg-cream py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  The 2-year gameplan
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">What matters, when.</h2>
              </div>
              <div className="grid gap-5">
                {c.plan.map((p, i) => (
                  <div
                    key={p.phase}
                    className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] grid md:grid-cols-[160px_1fr] gap-4 items-start"
                  >
                    <span className="font-display font-bold text-sm text-orange uppercase tracking-wider">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-lg text-charcoal mb-2">{p.phase}</h3>
                      <p className="text-sm text-inkSoft leading-relaxed">{p.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          <section id="skills" className="bg-white py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  Skill checklist
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-3">
                  Tick these before placement season.
                </h2>
                <p className="text-inkSoft text-sm">
                  {session?.user?.id ? "Your ticks sync to your account." : "Your ticks save on this device."}
                </p>
              </div>
              <div className="bg-cream rounded-2xl p-6 sm:p-8 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-charcoal">Progress</span>
                  <span className="text-sm font-bold text-charcoal">
                    {checked.length} / {c.skills.length}
                  </span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-orange transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {c.skills.map((s, i) => (
                  <label
                    key={s}
                    className="flex items-start gap-3 bg-cream rounded-xl p-4 cursor-pointer hover:bg-[#E5EDFF] transition"
                  >
                    <input
                      type="checkbox"
                      checked={checked.includes(i)}
                      onChange={() => toggle(i)}
                      className="w-5 h-5 accent-orange mt-0.5 cursor-pointer"
                    />
                    <span className="text-sm text-charcoal leading-relaxed">{s}</span>
                  </label>
                ))}
              </div>
            </Container>
          </section>

          <section id="signals" className="bg-cream py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">Signals</span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
                  What panels reward — and what they read through.
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
                  <h3 className="font-display font-bold text-lg text-charcoal mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-orange"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Do
                  </h3>
                  <ul className="space-y-3">
                    {c.signals.do.map((s) => (
                      <li key={s} className="flex items-start gap-3 text-sm text-charcoal">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange flex-none mt-2" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
                  <h3 className="font-display font-bold text-lg text-charcoal mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                    Don&apos;t
                  </h3>
                  <ul className="space-y-3">
                    {c.signals.dont.map((s) => (
                      <li key={s} className="flex items-start gap-3 text-sm text-charcoal">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-none mt-2" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Container>
          </section>

          <section id="colleges" className="bg-white py-16 sm:py-20">
            <Container>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  Where this stream is strong
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
                  Colleges with a real bench here.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {c.colleges.map((college) => (
                  <span
                    key={college}
                    className="text-sm font-medium bg-cream text-charcoal border border-charcoal/10 rounded-full px-4 py-2"
                  >
                    {college}
                  </span>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}

      <section className="bg-cream py-16 sm:py-20">
        <Container>
          <div className="relative bg-navy rounded-[34px] p-10 sm:p-14 overflow-hidden">
            <svg
              className="absolute -left-16 -top-16 w-64 opacity-15 pointer-events-none"
              viewBox="0 0 260 240"
              aria-hidden="true"
            >
              <path
                fill="#2E6BFF"
                d="M186 14c38 20 72 56 68 92-3 37-44 74-88 85-44 12-90-3-116-34C24 126 20 78 41 47 63 15 110 1 143 3c17 1 31 5 43 11Z"
              />
            </svg>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
                  A map is not a mentor.
                </h2>
                <p className="text-cream/70 max-w-md">
                  Personalised guidance for your profile is available through mentorship. Meanwhile, the playbooks go
                  deeper on every stream.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 min-w-[260px]">
                <div className="font-display font-extrabold text-3xl text-charcoal mb-1">
                  ₹{playbook.price} <small className="font-body font-normal text-sm text-inkSoft">one-time</small>
                </div>
                <p className="text-sm text-inkSoft mb-4">
                  <span className="text-orange font-bold">★ {playbook.rating.toFixed(1)}</span> · {playbook.meta}
                </p>
                {hasAccess ? (
                  <div className="text-center py-2">
                    <p className="text-sm font-semibold text-navy">In your library</p>
                    <p className="text-xs text-inkSoft">Scroll up to read the full playbook.</p>
                  </div>
                ) : bought ? (
                  <div className="text-center py-2">
                    <p className="text-sm font-semibold text-navy">Added to your library</p>
                    <p className="text-xs text-inkSoft">Refresh to access the full playbook.</p>
                  </div>
                ) : isShopPlaybook(playbook.category) ? (
                  <RazorpayButton
                    playbook={{ slug: playbook.slug, name: playbook.name, price: playbook.price }}
                    label={`Unlock for ₹${playbook.price}`}
                    onSuccess={() => setBought(true)}
                    className="w-full"
                  />
                ) : (
                  <Button onClick={() => setBought(true)} className="w-full">
                    Unlock playbook
                  </Button>
                )}
                <Link
                  href="/mentorship"
                  className="block text-center text-sm text-orangeDeep mt-4 hover:underline"
                >
                  Get a mentor instead →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
