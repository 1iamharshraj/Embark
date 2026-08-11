"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { PlaybookContent } from "@/lib/playbookContent";

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

interface PlaybookContentProps {
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

function isShopPlaybook(category: string) {
  return category === "interview" || category === "case";
}

export default function PlaybookContent({ playbook }: PlaybookContentProps) {
  const c = playbook.content;
  const { data: session, status: sessionStatus } = useSession();
  const [checked, setChecked] = useState<number[]>([]);

  // Load progress: authenticated from server, unauthenticated from localStorage.
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (isShopPlaybook(playbook.category)) return;
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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="chapter-bar" aria-label="Chapters">
        <div className="chapter-bar-inner">
          {chapters.map((ch) => (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              className="chapter-link"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(ch.id);
              }}
            >
              {ch.label}
            </a>
          ))}
        </div>
      </div>

      <section className="pb-section" id="fit">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">Is this you?</p>
            <h2>This playbook is for you if…</h2>
          </div>
          <ul className="foryou-list">
            {c.forYouIf.map((item) => (
              <li key={item}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-section" id="study">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">What you&apos;ll study</p>
            <h2>The courses that carry this stream.</h2>
          </div>
          <div className="study-chips">
            {c.study.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-section" id="roles">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">Where it leads</p>
            <h2>The roles, and the five-year arc.</h2>
          </div>
          <div className="role-grid">
            {c.roles.map((r) => (
              <div key={r.role} className="role-card">
                <h3>{r.role}</h3>
                <p>{r.desc}</p>
                <div className="role-arc">Arc: {r.arc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-section" id="recruiters">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">Who hires</p>
            <h2>Recruiters that own this corridor.</h2>
          </div>
          <div className="rec-row">
            {c.recruiters.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-section" id="plan">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">The 2-year gameplan</p>
            <h2>What matters, when.</h2>
          </div>
          <div className="pb-timeline">
            {c.plan.map((p) => (
              <div key={p.phase} className="pb-step">
                <h3>{p.phase}</h3>
                <p>{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-section" id="skills">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">Skill checklist</p>
            <h2>Tick these before placement season.</h2>
            <p>
              {session?.user?.id
                ? "Your ticks sync to your account."
                : "Your ticks save on this device."}
            </p>
          </div>
          <div className="check-wrap">
            <div className="check-progress">
              <div className="bar">
                <div className="fill" style={{ width: `${progress}%` }} />
              </div>
              <b>
                {checked.length} / {c.skills.length}
              </b>
            </div>
            {c.skills.map((s, i) => (
              <label key={s} className="check-item">
                <input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)} />
                <span>{s}</span>
              </label>
            ))}
            <p className="check-note">
              {session?.user?.id
                ? "Progress is saved to your account."
                : "Progress is saved on this device only (for now)."}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-section" id="signals">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">Signals</p>
            <h2>What panels reward — and what they read through.</h2>
          </div>
          <div className="dd-grid">
            <div className="dd-col dd-do">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Do
              </h3>
              <ul>
                {c.signals.do.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="dd-col dd-dont">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                Don&apos;t
              </h3>
              <ul>
                {c.signals.dont.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-section" id="colleges">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="sec-head">
            <p className="eyebrow">Where this stream is strong</p>
            <h2>Colleges with a real bench here.</h2>
            <p>These are the campuses where this stream runs deep.</p>
          </div>
          <div className="pb-colleges">
            {c.colleges.map((college) => (
              <span key={college}>{college}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-next">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="pb-next-card">
            <div>
              <h2>A map is not a mentor.</h2>
              <p>
                Personalised guidance for your profile — mentorship is coming to Embark India. Meanwhile, the
                playbooks go deeper on every stream.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/playbooks" className="btn btn-primary">
                Other streams
              </Link>
              <Link href="/mentorship" className="btn btn-ghost text-white border-white/30 hover:bg-white/10">
                Get a mentor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
