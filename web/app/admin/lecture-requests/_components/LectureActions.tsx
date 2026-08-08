"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface LectureActionsProps {
  id: string;
  status: string;
  note: string;
}

export default function LectureActions({ id, status, note }: LectureActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localNote, setLocalNote] = useState(note);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setMessage(null);
    const res = await fetch(`/api/admin/lecture-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note: localNote }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setMessage(data.error || "Update failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={localNote}
        onChange={(e) => setLocalNote(e.target.value)}
        placeholder="Internal note"
        className="rounded-lg bg-cream border border-transparent px-3 py-2 text-xs text-charcoal focus:bg-white focus:border-orange outline-none transition"
      />
      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <Button size="sm" onClick={() => updateStatus("shortlisted")} disabled={isPending}>
            Shortlist
          </Button>
        )}
        {status !== "confirmed" && status !== "completed" && status !== "cancelled" && (
          <Button size="sm" variant="green" onClick={() => updateStatus("confirmed")} disabled={isPending}>
            Confirm
          </Button>
        )}
        {status !== "completed" && status !== "cancelled" && (
          <Button size="sm" variant="ghost" onClick={() => updateStatus("completed")} disabled={isPending}>
            Complete
          </Button>
        )}
        {status !== "cancelled" && (
          <Button size="sm" variant="ghost" onClick={() => updateStatus("cancelled")} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
      {message && <p className="text-xs text-red-600">{message}</p>}
    </div>
  );
}
