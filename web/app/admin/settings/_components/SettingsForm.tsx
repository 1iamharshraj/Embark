"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

interface ConfigRow {
  id: string;
  key: string;
  value: string | null;
  defaultCommissionRate: number;
  currency: string;
}

export default function SettingsForm() {
  const [rows, setRows] = useState<ConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setRows(data.settings || []);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load settings" });
        setLoading(false);
      });
  }, []);

  function updateValue(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const settings = Object.fromEntries(
      rows.map((r) => [r.key, r.value === "" ? null : r.value])
    );

    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      setRows(data.settings || rows);
      setMessage({ type: "success", text: "Settings saved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      setMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal/8 p-8 text-center text-inkSoft">
        Loading settings…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8">
      {message && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {rows.length === 0 && (
          <p className="text-inkSoft text-sm">No configuration entries found.</p>
        )}
        {rows.map((row) => (
          <div key={row.id}>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">{row.key}</label>
            <input
              type="text"
              value={row.value ?? ""}
              onChange={(e) => updateValue(row.id, e.target.value)}
              className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
