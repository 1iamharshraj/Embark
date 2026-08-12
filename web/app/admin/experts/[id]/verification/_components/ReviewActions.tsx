"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewActionsProps {
  verificationId: string;
  expertId: string;
}

export function ReviewActions({ verificationId, expertId }: ReviewActionsProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function review(status: "VERIFIED" | "REJECTED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/expert-verifications/${verificationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to submit review");
        setLoading(false);
        return;
      }
      toast.success(status === "VERIFIED" ? "Expert verified" : "Expert rejected");
      router.push(`/admin/experts/${expertId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 p-6 space-y-4">
      <div>
        <label htmlFor="note" className="block text-sm font-semibold text-charcoal mb-1.5">
          Admin note
        </label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note for the expert"
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => review("VERIFIED")}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full font-semibold bg-green-600 text-white px-7 py-3 hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => review("REJECTED")}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full font-semibold bg-red-600 text-white px-7 py-3 hover:bg-red-700 transition disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
