"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { parseMembers, parseRounds } from "@/lib/competition";

interface Registration {
  id: string;
  teamName: string;
  members: unknown;
  submissions: { id: string; roundIdx: number; filePath: string | null; link: string | null }[];
  advancements: { roundIdx: number }[];
}

interface ProgressPageClientProps {
  competition: {
    id: string;
    title: string;
    rounds: unknown;
  };
  registrations: Registration[];
}

export default function ProgressPageClient({ competition, registrations }: ProgressPageClientProps) {
  const router = useRouter();
  const rounds = parseRounds(competition.rounds);
  const [selectedRound, setSelectedRound] = useState(0);
  const [selectedRegIds, setSelectedRegIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Eligible teams: for round 0, all teams; for round N>0, teams with a submission for round N-1.
  const eligibleRegistrations = registrations.filter((r) => {
    if (selectedRound === 0) return true;
    return r.submissions.some((s) => s.roundIdx === selectedRound - 1);
  });

  const handleToggle = (regId: string) => {
    setSelectedRegIds((prev) => {
      const next = new Set(prev);
      if (next.has(regId)) next.delete(regId);
      else next.add(regId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/competitions/${competition.id}/advancements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundIdx: selectedRound, regIds: Array.from(selectedRegIds) }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage(`Advanced ${selectedRegIds.size} team(s) to Round ${selectedRound + 1}.`);
      router.refresh();
    } else {
      setMessage(json.error || "Failed to save advancements");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/competitions" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
        ← Back to competitions
      </Link>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-orange mb-1">Progress</div>
        <h1 className="font-display font-bold text-3xl text-charcoal">{competition.title}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 p-5 mb-6">
        <label className="block text-sm font-semibold text-charcoal mb-2">Select round to advance teams into</label>
        <select
          className="w-full rounded-xl border border-charcoal/10 bg-cream px-4 py-2.5 text-sm text-charcoal"
          value={selectedRound}
          onChange={(e) => {
            setSelectedRound(Number(e.target.value));
            setSelectedRegIds(new Set());
            setMessage("");
          }}
        >
          {rounds.map((r, i) => (
            <option key={i} value={i}>Round {i + 1}: {r.name}</option>
          ))}
        </select>
        <p className="text-xs text-inkSoft mt-2">
          Teams eligible here {selectedRound === 0 ? "are all registered teams" : `have a submission for Round ${selectedRound}`}.
          Checked teams will be allowed to submit for Round {selectedRound + 1}.
        </p>
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
              <th className="text-left font-semibold text-charcoal px-5 py-3 w-12">Select</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Team</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Previous submission</th>
              <th className="text-left font-semibold text-charcoal px-5 py-3">Already advanced</th>
            </tr>
          </thead>
          <tbody>
            {eligibleRegistrations.map((r) => {
              const members = parseMembers(r.members);
              const prevSubmission = selectedRound > 0 ? r.submissions.find((s) => s.roundIdx === selectedRound - 1) : null;
              const alreadyAdvanced = r.advancements.some((a) => a.roundIdx === selectedRound - 1);
              return (
                <tr key={r.id} className="border-b border-charcoal/8 last:border-0">
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-charcoal/20 text-orange focus:ring-orange"
                      checked={selectedRegIds.has(r.id) || alreadyAdvanced}
                      disabled={alreadyAdvanced}
                      onChange={() => handleToggle(r.id)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-charcoal">{r.teamName}</div>
                    <div className="text-xs text-inkSoft">{members.map((m) => m.name).join(", ")}</div>
                  </td>
                  <td className="px-5 py-4">
                    {prevSubmission ? (
                      <div className="text-xs text-charcoal">
                        Round {prevSubmission.roundIdx + 1} submitted
                        {prevSubmission.filePath && <a href={`/api/submissions/${prevSubmission.id}/download`} className="text-orange hover:underline ml-2">Download</a>}
                        {prevSubmission.link && <a href={prevSubmission.link} target="_blank" rel="noreferrer" className="text-orange hover:underline ml-2">Link</a>}
                      </div>
                    ) : (
                      <span className="text-xs text-inkSoft">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {alreadyAdvanced ? <span className="text-xs text-green-700 font-semibold">Yes</span> : <span className="text-xs text-inkSoft">No</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save advancements"}
      </Button>
    </div>
  );
}
