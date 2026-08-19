"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminCard";
import Button from "@/components/Button";
import CustomRegistrationFields from "./CustomRegistrationFields";
import SubmissionSettings from "./SubmissionSettings";
import EvaluationCriteriaSettings from "./EvaluationCriteriaSettings";

interface Timeline {
  id?: string;
  phase: string;
  startsAt: string;
  endsAt: string | null;
}

interface Eligibility {
  userTypes: string[];
  colleges: string[];
  courses: string[];
  years: number[];
  geography: string[];
  mode: "INDIVIDUAL" | "TEAM" | "BOTH";
  teamMin: number;
  teamMax: number;
  criteria: string[];
}

interface ProblemResource {
  title: string;
  url?: string;
  description?: string;
}

interface ProblemFaq {
  question: string;
  answer: string;
}

interface ProblemStatement {
  title: string;
  description: string;
  background: string;
  businessProblem: string;
  challenge: string;
  objective: string;
  expectedOutput: string;
  constraints: string[];
  resources: ProblemResource[];
  faqs: ProblemFaq[];
}

interface Rules {
  eligibility: string[];
  registration: string[];
  teamRules: string[];
  submissionRules: string[];
  plagiarism: string[];
  aiUsage: string[];
  evaluationCriteria: string[];
  disqualification: string[];
  ip: string[];
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
  eligibility: Eligibility;
  fee: number;
  rules: Rules;
  problemStatement: ProblemStatement;
  evaluationCriteria: string;
  resources: string;
  faqs: string;
  settings: string;
  timelines: Timeline[];
}

interface HackathonFormProps {
  initial?: Omit<Partial<HackathonFormData>, "eligibility" | "rules" | "problemStatement" | "evaluationCriteria" | "resources" | "faqs" | "settings"> & {
    eligibility?: unknown;
    rules?: unknown;
    problemStatement?: unknown;
    evaluationCriteria?: unknown;
    resources?: unknown;
    faqs?: unknown;
    settings?: unknown;
  };
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

function parseJson<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function normalizeNumberArray(value: unknown): number[] {
  if (Array.isArray(value)) return value.filter((v): v is number => typeof v === "number");
  return [];
}

function normalizeEligibility(value: unknown): Eligibility {
  const raw = parseJson<Record<string, unknown>>(value) ?? {};
  return {
    userTypes: normalizeStringArray(raw.userTypes),
    colleges: normalizeStringArray(raw.colleges),
    courses: normalizeStringArray(raw.courses),
    years: normalizeNumberArray(raw.years),
    geography: normalizeStringArray(raw.geography),
    mode: ["INDIVIDUAL", "TEAM", "BOTH"].includes(raw.mode as string) ? (raw.mode as "INDIVIDUAL" | "TEAM" | "BOTH") : "BOTH",
    teamMin: typeof raw.teamMin === "number" ? raw.teamMin : 1,
    teamMax: typeof raw.teamMax === "number" ? raw.teamMax : 4,
    criteria: normalizeStringArray(raw.criteria),
  };
}

function normalizeProblemStatement(value: unknown): ProblemStatement {
  const raw = parseJson<Record<string, unknown>>(value) ?? {};
  const resources: ProblemResource[] = Array.isArray(raw.resources)
    ? raw.resources
        .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
        .map((r) => ({
          title: typeof r.title === "string" ? r.title : "",
          url: typeof r.url === "string" ? r.url : "",
          description: typeof r.description === "string" ? r.description : "",
        }))
        .filter((r) => r.title)
    : [];
  const faqs: ProblemFaq[] = Array.isArray(raw.faqs)
    ? raw.faqs
        .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
        .map((f) => ({
          question: typeof f.question === "string" ? f.question : "",
          answer: typeof f.answer === "string" ? f.answer : "",
        }))
        .filter((f) => f.question)
    : [];
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    description: typeof raw.description === "string" ? raw.description : "",
    background: typeof raw.background === "string" ? raw.background : "",
    businessProblem: typeof raw.businessProblem === "string" ? raw.businessProblem : "",
    challenge: typeof raw.challenge === "string" ? raw.challenge : "",
    objective: typeof raw.objective === "string" ? raw.objective : "",
    expectedOutput: typeof raw.expectedOutput === "string" ? raw.expectedOutput : "",
    constraints: normalizeStringArray(raw.constraints),
    resources,
    faqs,
  };
}

function normalizeRules(value: unknown): Rules {
  const raw = parseJson<Record<string, unknown>>(value) ?? {};
  return {
    eligibility: normalizeStringArray(raw.eligibility),
    registration: normalizeStringArray(raw.registration),
    teamRules: normalizeStringArray(raw.teamRules),
    submissionRules: normalizeStringArray(raw.submissionRules),
    plagiarism: normalizeStringArray(raw.plagiarism),
    aiUsage: normalizeStringArray(raw.aiUsage),
    evaluationCriteria: normalizeStringArray(raw.evaluationCriteria),
    disqualification: normalizeStringArray(raw.disqualification),
    ip: normalizeStringArray(raw.ip),
  };
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

function parseJsonText<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const TABS = ["basic", "details", "timeline", "eligibility", "problem", "rules", "registration", "submission", "evaluation", "json"] as const;
type Tab = (typeof TABS)[number];

export default function HackathonForm({ initial, mode, submitUrl }: HackathonFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>("basic");

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
    eligibility: normalizeEligibility(initial?.eligibility),
    fee: initial?.fee ?? 0,
    rules: normalizeRules(initial?.rules),
    problemStatement: normalizeProblemStatement(initial?.problemStatement),
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

  const updateEligibility = <K extends keyof Eligibility>(key: K, value: Eligibility[K]) => {
    setForm((prev) => ({ ...prev, eligibility: { ...prev.eligibility, [key]: value } }));
  };

  const updateProblem = <K extends keyof ProblemStatement>(key: K, value: ProblemStatement[K]) => {
    setForm((prev) => ({ ...prev, problemStatement: { ...prev.problemStatement, [key]: value } }));
  };

  const updateRules = <K extends keyof Rules>(key: K, value: Rules[K]) => {
    setForm((prev) => ({ ...prev, rules: { ...prev.rules, [key]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const eligibility = form.eligibility;
    const rules = form.rules;
    const problemStatement = form.problemStatement;
    const evaluationCriteria = parseJsonText(form.evaluationCriteria) ?? {};
    const resources = parseJsonText(form.resources) ?? {};
    const faqs = parseJsonText(form.faqs) ?? {};
    const settings = parseJsonText(form.settings) ?? {};

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
    "w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";
  const textareaMonoClass =
    "w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";

  const renderStringList = (
    items: string[],
    onChange: (items: string[]) => void,
    placeholder = "Add item",
    rows = 4
  ) => (
    <div className="space-y-2">
      <textarea
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        rows={rows}
        className={textareaClass}
        placeholder={`${placeholder} (one per line)`}
      />
      <p className="text-xs text-inkSoft">One item per line.</p>
    </div>
  );

  return (
    <AdminCard>
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
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
                {[
                  "DRAFT",
                  "PUBLISHED",
                  "REGISTRATION_OPEN",
                  "REGISTRATION_CLOSED",
                  "HACKATHON_ACTIVE",
                  "SUBMISSION_OPEN",
                  "SUBMISSION_CLOSED",
                  "EVALUATION",
                  "RESULTS_FINALIZED",
                  "RESULTS_PUBLISHED",
                  "CERTIFICATES_ISSUED",
                  "CLOSED",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Mode</label>
              <select
                value={form.participationMode}
                onChange={(e) => updateField("participationMode", e.target.value)}
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
              <label className={labelClass}>Fee (INR)</label>
              <input
                type="number"
                min={0}
                value={form.fee}
                onChange={(e) => updateField("fee", Number(e.target.value))}
                className={inputClass}
              />
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
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Detailed description / About</label>
              <textarea
                value={form.detailedDescription}
                onChange={(e) => updateField("detailedDescription", e.target.value)}
                rows={8}
                className={textareaClass}
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
                    <option value="HACKATHON">Hackathon</option>
                    <option value="SUBMISSION">Submission</option>
                    <option value="EVALUATION">Evaluation</option>
                    <option value="RESULT">Result</option>
                    <option value="CERTIFICATE">Certificate</option>
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

        {tab === "eligibility" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Eligible user types</label>
                {renderStringList(form.eligibility.userTypes, (v) => updateEligibility("userTypes", v), "e.g. STUDENT")}
              </div>
              <div>
                <label className={labelClass}>Geography</label>
                {renderStringList(form.eligibility.geography, (v) => updateEligibility("geography", v), "e.g. India")}
              </div>
              <div>
                <label className={labelClass}>Allowed colleges</label>
                {renderStringList(form.eligibility.colleges, (v) => updateEligibility("colleges", v), "Leave empty for all")}
              </div>
              <div>
                <label className={labelClass}>Allowed courses</label>
                {renderStringList(form.eligibility.courses, (v) => updateEligibility("courses", v), "e.g. B.Tech")}
              </div>
              <div>
                <label className={labelClass}>Allowed years</label>
                <input
                  type="text"
                  value={form.eligibility.years.join(", ")}
                  onChange={(e) =>
                    updateEligibility(
                      "years",
                      e.target.value
                        .split(",")
                        .map((s) => Number(s.trim()))
                        .filter((n) => !isNaN(n))
                    )
                  }
                  className={inputClass}
                  placeholder="e.g. 2, 3, 4"
                />
              </div>
              <div>
                <label className={labelClass}>Eligibility mode</label>
                <select
                  value={form.eligibility.mode}
                  onChange={(e) => updateEligibility("mode", e.target.value as Eligibility["mode"])}
                  className={inputClass}
                >
                  <option value="INDIVIDUAL">Individual only</option>
                  <option value="TEAM">Team only</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Min team size</label>
                <input
                  type="number"
                  min={1}
                  value={form.eligibility.teamMin}
                  onChange={(e) => updateEligibility("teamMin", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max team size</label>
                <input
                  type="number"
                  min={1}
                  value={form.eligibility.teamMax}
                  onChange={(e) => updateEligibility("teamMax", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Eligibility criteria</label>
              {renderStringList(form.eligibility.criteria, (v) => updateEligibility("criteria", v), "Must be currently enrolled", 6)}
            </div>
          </div>
        )}

        {tab === "problem" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Problem title</label>
              <input value={form.problemStatement.title} onChange={(e) => updateProblem("title", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={form.problemStatement.description}
                onChange={(e) => updateProblem("description", e.target.value)}
                rows={4}
                className={textareaClass}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Background</label>
                <textarea
                  value={form.problemStatement.background}
                  onChange={(e) => updateProblem("background", e.target.value)}
                  rows={4}
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Business problem</label>
                <textarea
                  value={form.problemStatement.businessProblem}
                  onChange={(e) => updateProblem("businessProblem", e.target.value)}
                  rows={4}
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Challenge</label>
                <textarea
                  value={form.problemStatement.challenge}
                  onChange={(e) => updateProblem("challenge", e.target.value)}
                  rows={4}
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Objective</label>
                <textarea
                  value={form.problemStatement.objective}
                  onChange={(e) => updateProblem("objective", e.target.value)}
                  rows={4}
                  className={textareaClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Expected output</label>
              <textarea
                value={form.problemStatement.expectedOutput}
                onChange={(e) => updateProblem("expectedOutput", e.target.value)}
                rows={4}
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Constraints</label>
              {renderStringList(form.problemStatement.constraints, (v) => updateProblem("constraints", v), "Max 5 min video")}
            </div>
            <div>
              <label className={labelClass}>Resources</label>
              <div className="space-y-3">
                {form.problemStatement.resources.map((r, i) => (
                  <div key={i} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end border border-charcoal/8 rounded-xl p-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Title</label>
                      <input
                        value={r.title}
                        onChange={(e) => {
                          const resources = [...form.problemStatement.resources];
                          resources[i] = { ...resources[i], title: e.target.value };
                          updateProblem("resources", resources);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">URL</label>
                      <input
                        value={r.url}
                        onChange={(e) => {
                          const resources = [...form.problemStatement.resources];
                          resources[i] = { ...resources[i], url: e.target.value };
                          updateProblem("resources", resources);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateProblem("resources", form.problemStatement.resources.filter((_, idx) => idx !== i))}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => updateProblem("resources", [...form.problemStatement.resources, { title: "", url: "" }])}
                  variant="ghost"
                  size="sm"
                >
                  + Add resource
                </Button>
              </div>
            </div>
            <div>
              <label className={labelClass}>FAQs</label>
              <div className="space-y-3">
                {form.problemStatement.faqs.map((f, i) => (
                  <div key={i} className="space-y-2 border border-charcoal/8 rounded-xl p-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Question</label>
                      <input
                        value={f.question}
                        onChange={(e) => {
                          const faqs = [...form.problemStatement.faqs];
                          faqs[i] = { ...faqs[i], question: e.target.value };
                          updateProblem("faqs", faqs);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Answer</label>
                      <textarea
                        value={f.answer}
                        onChange={(e) => {
                          const faqs = [...form.problemStatement.faqs];
                          faqs[i] = { ...faqs[i], answer: e.target.value };
                          updateProblem("faqs", faqs);
                        }}
                        rows={2}
                        className={textareaClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateProblem("faqs", form.problemStatement.faqs.filter((_, idx) => idx !== i))}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => updateProblem("faqs", [...form.problemStatement.faqs, { question: "", answer: "" }])}
                  variant="ghost"
                  size="sm"
                >
                  + Add FAQ
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === "rules" && (
          <div className="space-y-6">
            {(
              [
                ["eligibility", "Eligibility rules"],
                ["registration", "Registration rules"],
                ["teamRules", "Team rules"],
                ["submissionRules", "Submission rules"],
                ["plagiarism", "Plagiarism policy"],
                ["aiUsage", "AI usage policy"],
                ["evaluationCriteria", "Evaluation criteria"],
                ["disqualification", "Disqualification"],
                ["ip", "IP rules"],
              ] as [keyof Rules, string][]
            ).map(([key, label]) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                {renderStringList(form.rules[key], (v) => updateRules(key, v), `Add ${label.toLowerCase()}`)}
              </div>
            ))}
          </div>
        )}

        {tab === "registration" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Custom registration fields</label>
              <p className="text-sm text-inkSoft mb-3">
                Add extra questions students must answer when registering. Changes are saved into Settings JSON.
              </p>
              <CustomRegistrationFields
                settings={form.settings}
                onSettingsChange={(v) => updateField("settings", v)}
              />
            </div>
          </div>
        )}

        {tab === "submission" && (
          <div className="space-y-4">
            <SubmissionSettings settings={form.settings} onSettingsChange={(v) => updateField("settings", v)} />
          </div>
        )}

        {tab === "evaluation" && (
          <div className="space-y-4">
            <EvaluationCriteriaSettings
              evaluationCriteria={form.evaluationCriteria}
              onEvaluationCriteriaChange={(v) => updateField("evaluationCriteria", v)}
            />
          </div>
        )}

        {tab === "json" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Evaluation criteria (JSON)</label>
              <textarea
                value={form.evaluationCriteria}
                onChange={(e) => updateField("evaluationCriteria", e.target.value)}
                rows={6}
                className={textareaMonoClass}
              />
            </div>
            <div>
              <label className={labelClass}>Resources (JSON)</label>
              <textarea
                value={form.resources}
                onChange={(e) => updateField("resources", e.target.value)}
                rows={6}
                className={textareaMonoClass}
              />
            </div>
            <div>
              <label className={labelClass}>FAQs (JSON)</label>
              <textarea value={form.faqs} onChange={(e) => updateField("faqs", e.target.value)} rows={6} className={textareaMonoClass} />
            </div>
            <div>
              <label className={labelClass}>Settings (JSON)</label>
              <textarea
                value={form.settings}
                onChange={(e) => updateField("settings", e.target.value)}
                rows={6}
                className={textareaMonoClass}
              />
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
