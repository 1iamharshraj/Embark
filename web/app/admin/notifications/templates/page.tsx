"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
  variables: string[];
  active: boolean;
}

const emptyTemplate: Omit<Template, "id"> = {
  name: "",
  channel: "EMAIL",
  subject: "",
  body: "",
  variables: [],
  active: true,
};

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<Omit<Template, "id">>(emptyTemplate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    const res = await fetch("/api/v1/admin/notification-templates");
    const data = await res.json().catch(() => ({}));
    setTemplates(data.templates || []);
    setLoading(false);
  }

  function startEdit(template: Template) {
    setEditing(template);
    setForm(template);
    setError("");
  }

  function startCreate() {
    setEditing(null);
    setForm(emptyTemplate);
    setError("");
  }

  function updateField<K extends keyof Omit<Template, "id">>(key: K, value: Omit<Template, "id">[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editing
      ? `/api/v1/admin/notification-templates/${editing.id}`
      : "/api/v1/admin/notification-templates";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await fetchTemplates();
      setEditing(null);
      setForm(emptyTemplate);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Failed to save template");
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/v1/admin/notification-templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchTemplates();
    } else {
      alert("Failed to delete template");
    }
  }

  function highlightVariables(text: string) {
    return text.replace(/\{\{(\w+)\}\}/g, '<span class="text-orangeDeep">{{$1}}</span>');
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-charcoal">Notification templates</h1>
        <Link href="/admin" className="text-sm font-semibold text-orangeDeep hover:underline">
          Back to admin
        </Link>
      </div>

      <div className="bg-white border border-charcoal/8 rounded-2xl shadow-sm p-6 mb-8">
        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => updateField("channel", e.target.value)}
                className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
              >
                <option value="EMAIL">EMAIL</option>
                <option value="IN_APP">IN_APP</option>
                <option value="WHATSAPP">WHATSAPP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Subject</label>
            <input
              value={form.subject || ""}
              onChange={(e) => updateField("subject", e.target.value)}
              className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange/30"
              required
            />
            <p className="text-xs text-inkSoft mt-1">Use {"{{variableName}}"} for dynamic values.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Variables</label>
            <input
              value={form.variables.join(", ")}
              onChange={(e) =>
                updateField(
                  "variables",
                  e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                )
              }
              className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
              placeholder="userName, expertName, ..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => updateField("active", e.target.checked)}
              className="rounded border-charcoal/30"
            />
            <label htmlFor="active" className="text-sm text-charcoal">Active</label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update template" : "Create template"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-6 py-2.5 hover:bg-orange/10 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="text-inkSoft">Loading templates…</p>
      ) : templates.length === 0 ? (
        <p className="text-inkSoft">No templates yet.</p>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-charcoal/8 rounded-xl p-5 transition hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-charcoal">{template.name}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                        template.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {template.channel}
                    </span>
                  </div>
                  {template.subject && (
                    <p className="text-sm text-inkSoft mb-1">Subject: {template.subject}</p>
                  )}
                  <p
                    className="text-sm text-charcoal whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlightVariables(template.body) }}
                  />
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map((v) => (
                        <span
                          key={v}
                          className="text-[10px] font-semibold uppercase tracking-wider bg-cream text-charcoal rounded-full px-2 py-0.5"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(template)}
                    className="text-sm font-semibold text-orangeDeep hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(template.id)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
