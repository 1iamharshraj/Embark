"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  roles: { id: string; name: string }[];
}

interface UserRoleAssignProps {
  user: User;
  allRoles: Role[];
}

export default function UserRoleAssign({ user, allRoles }: UserRoleAssignProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(user.roles.map((r) => r.id)));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update roles");
      setMessage("Saved");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex flex-wrap gap-2">
        {allRoles.map((role) => {
          const checked = selected.has(role.id);
          return (
            <label
              key={role.id}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer transition ${
                checked
                  ? "bg-orange/10 border-orange text-orangeDeep"
                  : "bg-cream border-charcoal/12 text-inkSoft hover:border-charcoal/25"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(role.id);
                  else next.delete(role.id);
                  setSelected(next);
                }}
                className="sr-only"
              />
              {role.name}
            </label>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={loading}
          className="text-xs font-semibold bg-charcoal text-white rounded-full px-4 py-2 hover:bg-charcoal/90 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save roles"}
        </button>
        {message && <span className="text-xs text-inkSoft">{message}</span>}
      </div>
    </div>
  );
}
