"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminCard";
import Button from "@/components/Button";

interface Timeline {
  id?: string;
  phase: string;
  startsAt: string;
  endsAt: string | null;
}

interface HackathonFormData {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  banner: string;
  bannerUrl: string;
  logoUrl: string;
  status: string;
  shortDescription: string;
  detailedDescription: string;
  organizer: string;
  category: string;
  tags: string;
  participationMode: string;
  teamMin: number;
  teamMax: number;
  eligibility: string;
  fee: number;
  rules: string;
  problemStatement: string;
  evaluationCriteria: string;
  resources: string;
  faqs: string;
  settings: string;
  timelines: Timeline[];
}

interface HackathonFormProps {
  initial?: Partial<HackathonFormData>;
  mode: "create" | "edit";
  submitUrl: string;
}

function toDatetimeLocal(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function safeJson(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return "";
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function HackathonForm({ initial, mode, submitUrl }: HackathonFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"basic" | "details" | "timeline" | "json">("basic");

  const [form, setForm] = useState<HackathonFormData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    banner: initial?.banner ?? "orange",
    bannerUrl: initial?.bannerUrl ?? "",
    logoUrl: initial?.logoUrl ?? "",
    status: initial?.status ?? "DRAFT",
    shortDescription: initial?.shortDescription ?? "",
    detailedDescription: initial?.detailedDescription ?? "",
    organizer: initial?.organizer ?? "Embark India",
    category: initial?.category ?? "General Management",
    tags: Array.isArray(initial?.tags) ? initial.tags.join(", ") : initial?.tags ?? "",
    participationMode: initial?.participationMode ?? "TEAM",
    teamMin: initial?.teamMin ?? 1,
    teamMax: initial?.teamMax ?? 4,
    eligibility: safeJson(initial?.eligibility),
    fee: initial?.fee ?? 0,
    rules: safeJson(initial?.rules),
    problemStatement: safeJson(initial?.problemStatement),
    evaluationCriteria: safeJson(initial?.evaluationCriteria),
    resources: safeJson(initial?.resources),
    faqs: safeJson(initial?.faqs),
    settings: safeJson(initial?.settings),
    timelines: initial?.timelines?.length
      ? initial.timelines.map((t) => ({
          id: t.id,
          phase: t.phase,
          startsAt: toDatetimeLocal(t.startsAt),
          endsAt: toDatetimeLocal(t.endsAt),
        }))
      : [
          { phase: "REGISTRATION", startsAt: "", endsAt: "" },
          { phase: "SUBMISSION", startsAt: "", endsAt: "" },
        ],
  });

  const updateField = <K extends keyof HackathonFormData>(key: K, value: HackathonFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateTimeline = (index: number, field: keyof Timeline, value: string) => {
    setForm((prev) => {
      const timelines = [...prev.timelines];
      timelines[index] = { ...timelines[index], [field]: value };
      return { ...prev, timelines };
    });
  };

  const addTimeline = () => {
    setForm((prev) => ({
      ...prev,
      timelines: [...prev.timelines, { phase: "SUBMISSION", startsAt: "", endsAt: "" }],
    }));
  };

  const removeTimeline = (index: number) => {
    setForm((prev) => ({
      ...prev,
      timelines: prev.timelines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const eligibility = parseJson(form.eligibility) ?? {};
    const rules = parseJson(form.rules) ?? {};
    const problemStatement = parseJson(form.problemStatement) ?? {};
    const evaluationCriteria = parseJson(form.evaluationCriteria) ?? {};
    const resources = parseJson(form.resources) ?? {};
    const faqs = parseJson(form.faqs) ?? {};
    const settings = parseJson(form.settings) ?? {};

    const timelines = form.timelines
      .filter((t) => t.startsAt)
      .map((t) => ({
        id: t.id,
        phase: t.phase,
        startsAt: new Date(t.startsAt).toISOString(),
        endsAt: t.endsAt ? new Date(t.endsAt).toISOString() : null,
      }));

    const payload = {
      slug: form.slug,
      title: form.title,
      subtitle: form.subtitle,
      banner: form.banner,
      bannerUrl: form.bannerUrl,
      logoUrl: form.logoUrl,
      status: form.status,
      shortDescription: form.shortDescription,
      detailedDescription: form.detailedDescription,
      organizer: form.organizer,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      participationMode: form.participationMode,
      teamMin: Number(form.teamMin),
      teamMax: Number(form.teamMax),
      eligibility,
      fee: Number(form.fee),
      rules,
      problemStatement,
      evaluationCriteria,
      resources,
      faqs,
      settings,
      timelines,
    };

    const res = await fetch(submitUrl, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json.message || "Failed to save hackathon");
      setSaving(false);
      return;
    }

    router.push("/admin/hackathons");
  };

  const inputClass =
    "w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";
  const labelClass = "block text-sm font-semibold text-charcoal mb-1";
  const textareaClass =
    "w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";

  return (
    <AdminCard>
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="flex gap-2 mb-6">
          {(["basic", "details", "timeline", "json"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                tab === t ? "bg-orangeDeep text-white" : "bg-cream text-charcoal hover:bg-orange/10"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

        {tab === "basic" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass} required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Slug</label>
              <input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className={inputClass} required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Subtitle</label>
              <input value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input value={form.category} onChange={(e) => updateField("category", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => updateField("tags", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className={inputClass}>
                {["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "SUBMISSION_OPEN", "EVALUATION", "RESULTS_PUBLISHED", "CLOSED"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>Mode</label>
              <select
                value={form.participationMode}
                onChange={(e) => updateField("participationMode", e.target.value as "INDIVIDUAL" | "TEAM")}
                className={inputClass}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="TEAM">Team</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Team min</label>
              <input
                type="number"
                min={1}
                value={form.teamMin}
                onChange={(e) => updateField("teamMin", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Team max</label>
              <input
                type="number"
                min={1}
                value={form.teamMax}
                onChange={(e) => updateField("teamMax", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fee (INR paise)</label>
              <input type="number" min={0} value={form.fee} onChange={(e) => updateField("fee", Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Banner theme</label>
              <select value={form.banner} onChange={(e) => updateField("banner", e.target.value)} className={inputClass}>
                <option value="orange">Orange</option>
                <option value="green">Green</option>
                <option value="dark">Dark</option>
                <option value="charcoal">Charcoal</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Banner image URL</label>
              <input value={form.bannerUrl} onChange={(e) => updateField("bannerUrl", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Logo URL</label>
              <input value={form.logoUrl} onChange={(e) => updateField("logoUrl", e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {tab === "details" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Short description</label>
              <textarea
                value={form.shortDescription}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Detailed description / About</label>
              <textarea
                value={form.detailedDescription}
                onChange={(e) => updateField("detailedDescription", e.target.value)}
                rows={8}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Organizer</label>
              <input value={form.organizer} onChange={(e) => updateField("organizer", e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <div className="space-y-4">
            {form.timelines.map((t, i) => (
              <div key={i} className="grid sm:grid-cols-4 gap-3 items-end border border-charcoal/8 rounded-xl p-4">
                <div>
                  <label className={labelClass}>Phase</label>
                  <select
                    value={t.phase}
                    onChange={(e) => updateTimeline(i, "phase", e.target.value)}
                    className={inputClass}
                  >
                    <option value="REGISTRATION">Registration</option>
                    <option value="SUBMISSION">Submission</option>
                    <option value="EVALUATION">Evaluation</option>
                    <option value="RESULT">Result</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Starts at</label>
                  <input
                    type="datetime-local"
                    value={t.startsAt}
                    onChange={(e) => updateTimeline(i, "startsAt", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Ends at</label>
                  <input
                    type="datetime-local"
                    value={t.endsAt || ""}
                    onChange={(e) => updateTimeline(i, "endsAt", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeTimeline(i)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addTimeline} variant="ghost" size="sm">
              + Add phase
            </Button>
          </div>
        )}

        {tab === "json" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Eligibility (JSON)</label>
              <textarea value={form.eligibility} onChange={(e) => updateField("eligibility", e.target.value)} rows={6} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Rules (JSON)</label>
              <textarea value={form.rules} onChange={(e) => updateField("rules", e.target.value)} rows={6} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Problem statement (JSON)</label>
              <textarea value={form.problemStatement} onChange={(e) => updateField("problemStatement", e.target.value)} rows={6} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Evaluation criteria (JSON)</label>
              <textarea value={form.evaluationCriteria} onChange={(e) => updateField("evaluationCriteria", e.target.value)} rows={6} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Resources (JSON)</label>
              <textarea value={form.resources} onChange={(e) => updateField("resources", e.target.value)} rows={6} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>FAQs (JSON)</label>
              <textarea value={form.faqs} onChange={(e) => updateField("faqs", e.target.value)} rows={6} className={textareaClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Settings (JSON)</label>
              <textarea value={form.settings} onChange={(e) => updateField("settings", e.target.value)} rows={6} className={textareaClass} />
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-50"
          >
            {saving ? "Saving…" : mode === "create" ? "Create hackathon" : "Update hackathon"}
          </button>
          <Button href="/admin/hackathons" variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
