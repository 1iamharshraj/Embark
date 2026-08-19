"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/Button";

interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
  isCurrent: boolean;
  displayOrder: number;
}

const empty = (): Experience => ({
  id: "",
  company: "",
  role: "",
  description: "",
  startYear: null,
  endYear: null,
  isCurrent: false,
  displayOrder: 0,
});

export default function ExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/experts/experience")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        const data = (await res.json()) as { experiences: Experience[] };
        setItems(data.experiences.length ? data.experiences : [empty()]);
      })
      .catch(() => toast.error("Failed to load experience"))
      .finally(() => setLoading(false));
  }, []);

  function updateItem(index: number, field: keyof Experience, value: Experience[keyof Experience]) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function saveItem(index: number) {
    const item = items[index];
    if (!item.company.trim()) {
      toast.error("Company is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...item,
        startYear: item.startYear ? Number(item.startYear) : undefined,
        endYear: item.endYear ? Number(item.endYear) : undefined,
      };
      const res = item.id
        ? await fetch(`/api/v1/experts/experience/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/v1/experts/experience", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error("Save failed");
      const json = (await res.json()) as { experience: Experience };
      setItems((prev) => {
        const next = [...prev];
        next[index] = json.experience;
        return next;
      });
      toast.success(item.id ? "Experience updated" : "Experience added");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(index: number) {
    const item = items[index];
    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm("Delete this experience entry?")) return;
    try {
      const res = await fetch(`/api/v1/experts/experience/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((_, i) => i !== index));
      toast.success("Experience deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Experience</h1>
        <p className="text-inkSoft text-sm mt-1">List your professional roles, companies, and career highlights.</p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id || `new-${index}`}
            className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company *" value={item.company} onChange={(v) => updateItem(index, "company", v)} />
              <Field label="Role" value={item.role} onChange={(v) => updateItem(index, "role", v)} />
              <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                <NumberField label="Start year" value={item.startYear} onChange={(v) => updateItem(index, "startYear", v)} />
                <NumberField label="End year" value={item.endYear} onChange={(v) => updateItem(index, "endYear", v)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-charcoal">Description</label>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={item.isCurrent}
                onChange={(e) => updateItem(index, "isCurrent", e.target.checked)}
                className="w-4 h-4 accent-orangeDeep"
              />
              I currently work here
            </label>
            <div className="flex items-center justify-between pt-2 border-t border-charcoal/8">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Delete
              </button>
              <Button size="sm" onClick={() => saveItem(index)} disabled={saving}>
                {saving ? "Saving…" : item.id ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={() => setItems((prev) => [...prev, empty()])}>
        + Add another experience
      </Button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
      />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">{label}</label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
      />
    </div>
  );
}
