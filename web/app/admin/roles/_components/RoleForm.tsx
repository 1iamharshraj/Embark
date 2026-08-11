"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Button from "@/components/Button";

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

interface RoleFormProps {
  mode: "create" | "edit";
  submitUrl: string;
  initial?: {
    name: string;
    description: string;
    permissionIds: string[];
  };
  permissions: Permission[];
  header?: React.ReactNode;
}

export default function RoleForm({ mode, submitUrl, initial, permissions, header }: RoleFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.permissionIds || []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    acc[p.resource] = acc[p.resource] || [];
    acc[p.resource].push(p);
    return acc;
  }, {});

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = (resource: string) => {
    const ids = grouped[resource].map((p) => p.id);
    const allSelected = ids.every((id) => selected.has(id));
    const next = new Set(selected);
    ids.forEach((id) => {
      if (allSelected) next.delete(id);
      else next.add(id);
    });
    setSelected(next);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(submitUrl, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          permissionIds: Array.from(selected),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save role");
        setLoading(false);
        return;
      }

      router.push("/admin/roles");
      router.refresh();
    } catch {
      setError("Failed to save role");
      setLoading(false);
    }
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        {header && <div className="mb-8">{header}</div>}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-charcoal mb-1.5">
                Role name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-charcoal mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-charcoal">Permissions</h2>
              <span className="text-sm text-inkSoft">{selected.size} selected</span>
            </div>

            <div className="space-y-6">
              {Object.entries(grouped).map(([resource, perms]) => (
                <div key={resource}>
                  <button
                    type="button"
                    onClick={() => toggleAll(resource)}
                    className="text-sm font-semibold text-charcoal hover:text-orange mb-2 flex items-center gap-2"
                  >
                    <span className="capitalize">{resource}</span>
                    <span className="text-xs text-inkSoft font-normal">
                      ({perms.filter((p) => selected.has(p.id)).length}/{perms.length})
                    </span>
                  </button>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                          selected.has(p.id)
                            ? "border-orange bg-orange/5"
                            : "border-charcoal/8 hover:border-charcoal/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggle(p.id)}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-sm font-semibold text-charcoal">
                            {p.action}
                          </div>
                          {p.description && (
                            <div className="text-xs text-inkSoft">{p.description}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create role" : "Update role"}
            </Button>
            <Button href="/admin/roles" variant="ghost">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
