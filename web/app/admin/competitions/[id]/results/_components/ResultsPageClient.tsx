"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { parseMembers } from "@/lib/competition";

interface Registration {
  id: string;
  teamName: string;
  members: unknown;
  submissions: { roundIdx: number }[];
  advancements: { roundIdx: number }[];
}

interface ResultsPageClientProps {
  competition: {
    id: string;
    title: string;
  };
  registrations: Registration[];
  lastRoundIndex: number;
  winners: { regId: string; rank: number; teamName: string }[];
}

export default function ResultsPageClient({ competition, registrations, lastRoundIndex, winners }: ResultsPageClientProps) {
  const router = useRouter();
  const [ranks, setRanks] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const w of winners) map[w.regId] = w.rank;
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Teams eligible for results: advanced through the last round (or all teams if no advancements needed for round 0).
  const eligibleRegistrations = registrations.filter((r) => {
    if (lastRoundIndex <= 0) return true;
    return r.advancements.some((a) => a.roundIdx === lastRoundIndex - 1);
  });

  const updateRank = (regId: string, rank: number | "") => {
    setRanks((prev) => {
      const next = { ...prev };
      if (rank === "") delete next[regId];
      else next[regId] = rank;
      return next;
    });
  };

  const handleSave = async () => {
    const winnersPayload = Object.entries(ranks)
      .filter(([, rank]) => rank > 0)
      .map(([regId, rank]) => {
        const reg = registrations.find((r) => r.id === regId);
        return { regId, rank, teamName: reg?.teamName ?? "" };
      });

    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/competitions/${competition.id}/winners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winners: winnersPayload }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage("Results saved.");
      router.refresh();
    } else {
      setMessage(json.error || "Failed to save results");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/competitions" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
        ← Back to competitions
      </Link>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-orange mb-1">Results</div>
        <h1 className="font-display font-bold text-3xl text-charcoal">{competition.title}</h1>
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm mb-6 ${message.includes("failed") || message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-cream border-b border-charcoal/8">
            <tr>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Team</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Rank</th>
            </tr>
          </thead>
          <tbody>
            {eligibleRegistrations.map((r) => {
              const members = parseMembers(r.members);
              return (
                <tr key={r.id} className="border-b border-charcoal/8 last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-charcoal">{r.teamName}</div>
                    <div className="text-xs text-inkSoft">{members.map((m) => m.name).join(", ")}</div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      className="rounded-xl border border-charcoal/10 bg-cream px-3 py-2 text-sm text-charcoal"
                      value={ranks[r.id] ?? ""}
                      onChange={(e) => updateRank(r.id, e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">No rank</option>
                      <option value={1}>1st</option>
                      <option value={2}>2nd</option>
                      <option value={3}>3rd</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {eligibleRegistrations.length === 0 && (
              <tr>
                <td colSpan={2} className="px-5 py-10 text-center text-inkSoft">
                  No eligible teams. Advance teams through the final round first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save results"}
      </Button>
    </div>
  );
}
