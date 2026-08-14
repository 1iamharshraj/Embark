"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default function ResultsPublish({
  hackathonId,
  status,
}: {
  hackathonId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function publish() {
    setLoading(true);
    setMessage("");

    const res = await fetch(`/api/v1/admin/hackathons/${hackathonId}/results/publish`, {
      method: "POST",
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage(`Results published. ${data.results ?? 0} ranked submissions.`);
      router.refresh();
    } else {
      setMessage(data.message || "Failed to publish results");
    }
    setLoading(false);
  }

  return (
    <AdminCard>
      <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-charcoal">Publish results</h2>
          <p className="text-sm text-inkSoft">
            This will rank submissions by finalized evaluation scores, create result records, and enqueue certificate
            generation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === "RESULTS_PUBLISHED" && <StatusBadge status="Published" />}
          <button
            type="button"
            onClick={publish}
            disabled={loading || status === "RESULTS_PUBLISHED"}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-green text-white px-6 py-2.5 hover:bg-navyDeep transition disabled:opacity-50"
          >
            {loading ? "Publishing…" : "Publish results"}
          </button>
        </div>
      </div>
      {message && (
        <p className={`text-sm px-6 pb-6 ${message.includes("published") ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </AdminCard>
  );
}
