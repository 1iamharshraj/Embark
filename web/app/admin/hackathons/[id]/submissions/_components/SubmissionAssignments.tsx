"use client";

import { useState } from "react";

interface Submission {
  id: string;
  title: string;
  status: string;
  score: number | null;
  createdAt: string;
  files: { name: string; url: string }[];
  team: { name: string; members: { user: { id: string; name: string } }[] } | null;
}

interface Judge {
  id: string;
  user: { id: string; name: string; email: string };
}

interface Assignment {
  id: string;
  judgeId: string;
  submissionId: string;
  judge: { user: { name: string; email: string } };
}

export default function SubmissionAssignments({
  submissions,
  judges,
  assignments,
}: {
  submissions: Submission[];
  judges: Judge[];
  assignments: Assignment[];
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<Record<string, string>>({});

  async function assign(submissionId: string) {
    const judgeId = selected[submissionId];
    if (!judgeId) return;

    setLoading((prev) => ({ ...prev, [submissionId]: true }));
    setMessage((prev) => ({ ...prev, [submissionId]: "" }));

    const res = await fetch("/api/v1/admin/judge-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judgeId, submissionId }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage((prev) => ({ ...prev, [submissionId]: "Assigned" }));
    } else {
      setMessage((prev) => ({ ...prev, [submissionId]: data.message || "Failed to assign" }));
    }
    setLoading((prev) => ({ ...prev, [submissionId]: false }));
  }

  function assignedTo(submissionId: string) {
    return assignments.filter((a) => a.submissionId === submissionId);
  }

  return (
    <div className="space-y-4">
      {submissions.length === 0 && <p className="text-inkSoft">No submissions yet.</p>}
      {submissions.map((sub) => (
        <div key={sub.id} className="bg-white rounded-2xl border border-charcoal/8 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-charcoal">{sub.title}</h3>
              <p className="text-sm text-inkSoft">Team: {sub.team?.name || "Solo"}</p>
              <p className="text-xs text-inkSoft mt-1">{new Date(sub.createdAt).toLocaleString()}</p>
              {sub.score !== null && <p className="text-sm text-charcoal mt-1 font-semibold">Score: {sub.score}</p>}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selected[sub.id] || ""}
                onChange={(e) => setSelected((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                className="rounded-xl border border-charcoal/15 px-3 py-2 text-sm bg-white"
              >
                <option value="">Select judge</option>
                {judges.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.user.name} ({j.user.email})
                  </option>
                ))}
              </select>
              <button
                onClick={() => assign(sub.id)}
                disabled={loading[sub.id] || !selected[sub.id]}
                className="rounded-full bg-orangeDeep text-white text-sm font-semibold px-4 py-2 hover:bg-[#1740A8] transition disabled:opacity-50"
              >
                {loading[sub.id] ? "…" : "Assign"}
              </button>
            </div>
          </div>

          {sub.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {sub.files.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-orangeDeep hover:underline bg-cream rounded-full px-3 py-1"
                >
                  {f.name}
                </a>
              ))}
            </div>
          )}

          {assignedTo(sub.id).length > 0 && (
            <div className="text-xs text-inkSoft">
              Assigned to:{" "}
              {assignedTo(sub.id)
                .map((a) => a.judge.user.name || a.judge.user.email)
                .join(", ")}
            </div>
          )}

          {message[sub.id] && <p className="text-sm mt-2 text-green-700">{message[sub.id]}</p>}
        </div>
      ))}
    </div>
  );
}
