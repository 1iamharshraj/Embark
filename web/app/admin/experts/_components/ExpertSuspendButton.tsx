"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExpertSuspendButton({ expertId, active }: { expertId: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(active);

  async function toggle() {
    setLoading(true);
    const next = !current;
    const res = await fetch(`/api/v1/admin/experts/${expertId}/suspend`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (res.ok) {
      setCurrent(next);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
        current
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      }`}
    >
      {loading ? "…" : current ? "Suspend expert" : "Reactivate expert"}
    </button>
  );
}
