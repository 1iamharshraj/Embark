"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDeleteButton({
  userId,
  userName,
  disabled,
}: {
  userId: string;
  userName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-inkSoft">
          Delete <strong>{userName}</strong>?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-cream text-charcoal border border-charcoal/12 hover:bg-charcoal/5"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      disabled={disabled}
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Delete
    </button>
  );
}
