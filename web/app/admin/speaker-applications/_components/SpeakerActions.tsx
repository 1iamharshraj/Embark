"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface SpeakerActionsProps {
  id: string;
  status: string;
  note: string;
}

export default function SpeakerActions({ id, status, note }: SpeakerActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localNote, setLocalNote] = useState(note);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setMessage(null);
    const res = await fetch(`/api/admin/speaker-applications/${id}`, {
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
        {status !== "verified" && status !== "rejected" && (
          <Button size="sm" onClick={() => updateStatus("verified")} disabled={isPending}>
            Approve
          </Button>
        )}
        {status !== "rejected" && status !== "verified" && (
          <Button size="sm" variant="ghost" onClick={() => updateStatus("rejected")} disabled={isPending}>
            Reject
          </Button>
        )}
      </div>
      {message && <p className="text-xs text-red-600">{message}</p>}
    </div>
  );
}
