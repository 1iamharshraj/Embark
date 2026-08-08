"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface Round {
  name: string;
  brief: string;
  type: string;
  link: string;
  opens: string;
  closes: string;
}

interface CompetitionFormProps {
  initial?: {
    id: string;
    title: string;
    host: string;
    category: string;
    banner: string;
    fee: number;
    teamMin: number;
    teamMax: number;
    eligibility: string;
    about: string;
    rules: string[];
    prizes: unknown;
    ppo: boolean;
    beginner: boolean;
    draft: boolean;
    regOpen: string;
    regClose: string;
    startAt: string;
    endAt: string;
    resultAt: string | null;
    rounds: Round[];
    eligibilityCriteria: string[];
    teamStructure: string[];
    institutes: string[];
    compStructure: string[];
    submissionGuidelines: string[];
    contacts: unknown;
    aboutHost: string;
    faqs: unknown;
    viewBoost: number;
    seedRegs: number;
  };
  mode: "create" | "edit";
  submitUrl: string;
}

function toDatetimeLocal(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function arrayFromText(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

function textFromArray(arr: string[]): string {
  return arr.join("\n");
}

function safeJson(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
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

export default function CompetitionForm({ initial, mode, submitUrl }: CompetitionFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    id: initial?.id ?? "",
    title: initial?.title ?? "",
    host: initial?.host ?? "Embark India",
    category: initial?.category ?? "General Management",
    banner: initial?.banner ?? "orange",
    fee: initial?.fee ?? 0,
    teamMin: initial?.teamMin ?? 1,
    teamMax: initial?.teamMax ?? 4,
    eligibility: initial?.eligibility ?? "",
    about: initial?.about ?? "",
    rulesText: textFromArray(initial?.rules ?? []),
    prizesText: safeJson(initial?.prizes),
    ppo: initial?.ppo ?? false,
    beginner: initial?.beginner ?? false,
    published: initial ? !initial.draft : false,
    regOpen: toDatetimeLocal(initial?.regOpen ?? null),
    regClose: toDatetimeLocal(initial?.regClose ?? null),
    startAt: toDatetimeLocal(initial?.startAt ?? null),
    endAt: toDatetimeLocal(initial?.endAt ?? null),
    resultAt: toDatetimeLocal(initial?.resultAt ?? null),
    rounds: initial?.rounds?.length ? initial.rounds : [{ name: "", brief: "", type: "", link: "", opens: "", closes: "" }],
    eligibilityCriteriaText: textFromArray(initial?.eligibilityCriteria ?? []),
    teamStructureText: textFromArray(initial?.teamStructure ?? []),
    institutesText: textFromArray(initial?.institutes ?? []),
    compStructureText: textFromArray(initial?.compStructure ?? []),
    submissionGuidelinesText: textFromArray(initial?.submissionGuidelines ?? []),
    contactsText: safeJson(initial?.contacts),
    aboutHost: initial?.aboutHost ?? "",
    faqsText: safeJson(initial?.faqs),
    viewBoost: initial?.viewBoost ?? 0,
    seedRegs: initial?.seedRegs ?? 0,
  });

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRound = (index: number, field: keyof Round, value: string) => {
    setForm((prev) => {
      const rounds = [...prev.rounds];
      rounds[index] = { ...rounds[index], [field]: value };
      return { ...prev, rounds };
    });
  };

  const addRound = () => {
    setForm((prev) => ({ ...prev, rounds: [...prev.rounds, { name: "", brief: "", type: "", link: "", opens: "", closes: "" }] }));
  };

  const removeRound = (index: number) => {
    setForm((prev) => ({ ...prev, rounds: prev.rounds.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const prizes = parseJson(form.prizesText) ?? [];
    const contacts = parseJson(form.contactsText) ?? [];
    const faqs = parseJson(form.faqsText) ?? [];

    const payload = {
      id: form.id,
      title: form.title,
      host: form.host,
      category: form.category,
      banner: form.banner,
      fee: Number(form.fee),
      teamMin: Number(form.teamMin),
      teamMax: Number(form.teamMax),
      eligibility: form.eligibility,
      about: form.about,
      rules: arrayFromText(form.rulesText),
      prizes,
      ppo: form.ppo,
      beginner: form.beginner,
      published: form.published,
      regOpen: new Date(form.regOpen).toISOString(),
      regClose: new Date(form.regClose).toISOString(),
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      resultAt: form.resultAt ? new Date(form.resultAt).toISOString() : null,
      rounds: form.rounds.map((r) => ({ ...r, opens: r.opens ? new Date(r.opens).toISOString() : null, closes: r.closes ? new Date(r.closes).toISOString() : null })),
      eligibilityCriteria: arrayFromText(form.eligibilityCriteriaText),
      teamStructure: arrayFromText(form.teamStructureText),
      institutes: arrayFromText(form.institutesText),
      compStructure: arrayFromText(form.compStructureText),
      submissionGuidelines: arrayFromText(form.submissionGuidelinesText),
      contacts,
      aboutHost: form.aboutHost,
      faqs,
      viewBoost: Number(form.viewBoost),
      seedRegs: Number(form.seedRegs),
    };

    const res = await fetch(submitUrl, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json.error || "Failed to save competition");
      setSaving(false);
      return;
    }

    setMessage("Saved successfully.");
    if (mode === "create") {
      router.push(`/admin/competitions/${json.competition.id}/edit`);
    } else {
      router.refresh();
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    const res = await fetch(`/api/admin/competitions/${form.id}/publish`, { method: "POST" });
    if (res.ok) {
      updateField("published", true);
      setMessage("Published.");
      router.refresh();
    } else {
      setMessage("Publish failed.");
    }
  };

  const handleUnpublish = async () => {
    const res = await fetch(`/api/admin/competitions/${form.id}/unpublish`, { method: "POST" });
    if (res.ok) {
      updateField("published", false);
      setMessage("Unpublished.");
      router.refresh();
    } else {
      setMessage("Unpublish failed.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this competition permanently?")) return;
    const res = await fetch(`/api/admin/competitions/${form.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/competitions");
    } else {
      setMessage("Delete failed.");
    }
  };

  const inputClass = "w-full rounded-xl border border-charcoal/10 bg-white px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30";
  const labelClass = "block text-sm font-semibold text-charcoal mb-1.5";
  const checkboxClass = "h-4 w-4 rounded border-charcoal/20 text-orange focus:ring-orange";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm ${message.includes("failed") || message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>ID (slug)</label>
          <input className={inputClass} value={form.id} onChange={(e) => updateField("id", e.target.value)} disabled={mode === "edit"} required />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Host</label>
          <input className={inputClass} value={form.host} onChange={(e) => updateField("host", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={(e) => updateField("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Banner theme</label>
          <select className={inputClass} value={form.banner} onChange={(e) => updateField("banner", e.target.value)}>
            <option value="orange">Orange</option>
            <option value="green">Green</option>
            <option value="dark">Dark</option>
            <option value="charcoal">Charcoal</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Fee</label>
            <input type="number" className={inputClass} value={form.fee} onChange={(e) => updateField("fee", Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Min team</label>
            <input type="number" className={inputClass} value={form.teamMin} onChange={(e) => updateField("teamMin", Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Max team</label>
            <input type="number" className={inputClass} value={form.teamMax} onChange={(e) => updateField("teamMax", Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Registration opens</label>
          <input type="datetime-local" className={inputClass} value={form.regOpen} onChange={(e) => updateField("regOpen", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Registration closes</label>
          <input type="datetime-local" className={inputClass} value={form.regClose} onChange={(e) => updateField("regClose", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Competition starts</label>
          <input type="datetime-local" className={inputClass} value={form.startAt} onChange={(e) => updateField("startAt", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Competition ends</label>
          <input type="datetime-local" className={inputClass} value={form.endAt} onChange={(e) => updateField("endAt", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Results at</label>
          <input type="datetime-local" className={inputClass} value={form.resultAt} onChange={(e) => updateField("resultAt", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Eligibility</label>
          <textarea className={inputClass} rows={4} value={form.eligibility} onChange={(e) => updateField("eligibility", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>About</label>
          <textarea className={inputClass} rows={4} value={form.about} onChange={(e) => updateField("about", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Rules (one per line)</label>
        <textarea className={inputClass} rows={4} value={form.rulesText} onChange={(e) => updateField("rulesText", e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Prizes (JSON array of [label, value])</label>
          <textarea className={inputClass} rows={4} value={form.prizesText} onChange={(e) => updateField("prizesText", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>FAQs (JSON array of {`{question, answer}`})</label>
          <textarea className={inputClass} rows={4} value={form.faqsText} onChange={(e) => updateField("faqsText", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Eligibility criteria (one per line)</label>
          <textarea className={inputClass} rows={3} value={form.eligibilityCriteriaText} onChange={(e) => updateField("eligibilityCriteriaText", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Team structure (one per line)</label>
          <textarea className={inputClass} rows={3} value={form.teamStructureText} onChange={(e) => updateField("teamStructureText", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Allowed institutes (one per line, blank for all)</label>
          <textarea className={inputClass} rows={3} value={form.institutesText} onChange={(e) => updateField("institutesText", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Competition structure (one per line)</label>
          <textarea className={inputClass} rows={3} value={form.compStructureText} onChange={(e) => updateField("compStructureText", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Submission guidelines (one per line)</label>
        <textarea className={inputClass} rows={3} value={form.submissionGuidelinesText} onChange={(e) => updateField("submissionGuidelinesText", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Contacts (JSON array of {`{name, email, phone, role}`})</label>
        <textarea className={inputClass} rows={3} value={form.contactsText} onChange={(e) => updateField("contactsText", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>About host</label>
        <textarea className={inputClass} rows={3} value={form.aboutHost} onChange={(e) => updateField("aboutHost", e.target.value)} />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" className={checkboxClass} checked={form.ppo} onChange={(e) => updateField("ppo", e.target.checked)} />
          PPO opportunity
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" className={checkboxClass} checked={form.beginner} onChange={(e) => updateField("beginner", e.target.checked)} />
          Beginner-friendly
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" className={checkboxClass} checked={form.published} onChange={(e) => updateField("published", e.target.checked)} />
          Published
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>View boost</label>
          <input type="number" className={inputClass} value={form.viewBoost} onChange={(e) => updateField("viewBoost", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Seed registrations</label>
          <input type="number" className={inputClass} value={form.seedRegs} onChange={(e) => updateField("seedRegs", Number(e.target.value))} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>Rounds</label>
          <button type="button" onClick={addRound} className="text-sm font-semibold text-orange hover:underline">+ Add round</button>
        </div>
        <div className="space-y-4">
          {form.rounds.map((round, i) => (
            <div key={i} className="bg-white rounded-xl border border-charcoal/8 p-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-inkSoft mb-1">Name</label>
                <input className={inputClass} value={round.name} onChange={(e) => updateRound(i, "name", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-inkSoft mb-1">Type</label>
                <input className={inputClass} value={round.type} onChange={(e) => updateRound(i, "type", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-inkSoft mb-1">Brief</label>
                <input className={inputClass} value={round.brief} onChange={(e) => updateRound(i, "brief", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-inkSoft mb-1">Opens</label>
                <input type="datetime-local" className={inputClass} value={round.opens} onChange={(e) => updateRound(i, "opens", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-inkSoft mb-1">Closes</label>
                <input type="datetime-local" className={inputClass} value={round.closes} onChange={(e) => updateRound(i, "closes", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-inkSoft mb-1">Link (optional)</label>
                <input className={inputClass} value={round.link} onChange={(e) => updateRound(i, "link", e.target.value)} />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => removeRound(i)} className="text-sm font-semibold text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save competition"}</Button>
        {mode === "edit" && (
          <>
            {!form.published ? (
              <button type="button" onClick={handlePublish} className="inline-flex items-center justify-center rounded-xl bg-green-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-green-700 transition">
                Publish
              </button>
            ) : (
              <button type="button" onClick={handleUnpublish} className="inline-flex items-center justify-center rounded-xl bg-gray-700 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 transition">
                Unpublish
              </button>
            )}
            <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center rounded-xl bg-red-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-700 transition">
              Delete
            </button>
          </>
        )}
      </div>
    </form>
  );
}
