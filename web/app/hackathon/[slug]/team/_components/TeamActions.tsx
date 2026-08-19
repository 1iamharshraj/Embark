"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveMemberButton({ teamId, userId }: { teamId: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Remove this member from the team?")) return;
    setLoading(true);
    const res = await fetch(`/api/v1/teams/${teamId}/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Failed to remove member");
    } else {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}

export function LeaveTeamButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLeave(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Leave this team?")) return;
    setLoading(true);
    const res = await fetch(`/api/v1/teams/${teamId}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Failed to leave team");
    } else {
      router.push("/hackathons");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLeave}
      disabled={loading}
      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Leaving…" : "Leave team"}
    </button>
  );
}
