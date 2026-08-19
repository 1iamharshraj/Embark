"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CustomerNotesFormProps {
  studentId: string;
}

export default function CustomerNotesForm({ studentId }: CustomerNotesFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/experts/customers/${studentId}/notes`);
        const json = await res.json();
        if (res.ok) {
          setContent(json.note?.content || "");
        } else {
          toast.error(json.message || "Failed to load notes");
        }
      } catch {
        toast.error("Failed to load notes");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/experts/customers/${studentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setContent(json.note?.content || "");
        toast.success("Note saved");
      } else {
        toast.error(json.message || "Failed to save note");
      }
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-cream/60 rounded-xl p-6">
        <p className="text-sm text-inkSoft">Loading notes…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="customer-note" className="block text-sm font-semibold text-charcoal">
        Private notes
      </label>
      <p className="text-xs text-inkSoft/70">
        Only you can see this. Students will never have access to these notes.
      </p>
      <textarea
        id="customer-note"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="e.g. Interested in consulting. Needs case preparation."
        className="w-full rounded-xl border border-charcoal/12 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-inkSoft/40 focus:outline-none focus:ring-2 focus:ring-orange/30"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-inkSoft/60">{content.length}/5000</p>
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="text-sm font-semibold px-5 py-2.5 rounded-full bg-orangeDeep text-white hover:bg-orange transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </form>
  );
}
