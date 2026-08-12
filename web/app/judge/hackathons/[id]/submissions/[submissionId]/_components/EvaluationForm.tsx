"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface Criterion {
  name: string;
  weight?: number;
}

interface ExistingScore {
  criterionName: string;
  score: number;
  comment?: string | null;
}

interface EvaluationFormProps {
  hackathon: {
    id: string;
    title: string;
    slug: string;
  };
  submission: {
    id: string;
    title: string;
    status: string;
    content?: Record<string, unknown> | null;
    files: { name: string; url: string; type: string; size: number }[];
    team: { name: string } | null;
  };
  criteria: Criterion[];
  existingEvaluation: {
    id: string;
    score: number | null;
    comment: string | null;
    finalizedAt: Date | null;
    scores: ExistingScore[];
  } | null;
}

interface ScoreInput {
  name: string;
  weight: number;
  score: string;
  comment: string;
}

function toScoreInputs(criteria: Criterion[], existing: ExistingScore[] | undefined): ScoreInput[] {
  const existingMap = new Map((existing || []).map((s) => [s.criterionName, s]));
  return criteria.map((c) => {
    const prev = existingMap.get(c.name);
    return {
      name: c.name,
      weight: typeof c.weight === "number" && c.weight > 0 ? c.weight : 1,
      score: prev ? String(prev.score) : "",
      comment: prev?.comment || "",
    };
  });
}

function calculateWeighted(scores: ScoreInput[]): number {
  const numeric = scores.map((s) => ({ score: Number(s.score) || 0, weight: s.weight }));
  const totalWeight = numeric.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = numeric.reduce((sum, s) => sum + s.score * s.weight, 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

export default function EvaluationForm({ hackathon, submission, criteria, existingEvaluation }: EvaluationFormProps) {
  const router = useRouter();
  const [scores, setScores] = useState<ScoreInput[]>(() =>
    toScoreInputs(criteria, existingEvaluation?.scores)
  );
  const [comment, setComment] = useState(existingEvaluation?.comment || "");
  const [finalized, setFinalized] = useState(Boolean(existingEvaluation?.finalizedAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isLocked = Boolean(existingEvaluation?.finalizedAt);

  function updateScore(index: number, field: keyof ScoreInput, value: string) {
    if (isLocked) return;
    setScores((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSubmit(finalize: boolean) {
    setError("");

    const numericScores = scores.map((s) => {
      const score = Number(s.score);
      if (Number.isNaN(score) || s.score === "") {
        throw new Error(`Score for "${s.name}" is required`);
      }
      if (score < 0 || score > 100) {
        throw new Error(`Score for "${s.name}" must be between 0 and 100`);
      }
      return {
        criterionName: s.name,
        score,
        weight: s.weight,
        comment: s.comment,
      };
    });

    setSaving(true);

    try {
      const res = await fetch("/api/v1/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          scores: numericScores,
          comment,
          finalized: finalize,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to save evaluation");
        setSaving(false);
        return;
      }

      setSuccess(true);
      if (finalize) {
        setFinalized(true);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  }

  const weightedPreview = calculateWeighted(scores);

  return (
    <form className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-xl text-charcoal">{submission.title}</h2>
          <p className="text-sm text-inkSoft">Team: {submission.team?.name || "Solo"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-inkSoft">Weighted score</p>
          <p className="text-2xl font-bold text-charcoal">{weightedPreview}</p>
        </div>
      </div>

      {submission.files.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-charcoal mb-2">Submitted files</h3>
          <div className="flex flex-wrap gap-2">
            {submission.files.map((f, i) => (
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
        </div>
      )}

      {submission.content && Object.keys(submission.content).length > 0 && (
        <div className="bg-cream rounded-xl p-4 text-sm text-charcoal">
          <h3 className="font-semibold mb-2">Submission content</h3>
          <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(submission.content, null, 2)}</pre>
        </div>
      )}

      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-charcoal">Evaluation criteria</h3>
        {scores.map((s, i) => (
          <div key={s.name} className="border border-charcoal/8 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-charcoal">{s.name}</label>
              <span className="text-xs text-inkSoft">Weight: {s.weight}</span>
            </div>
            <div>
              <label className="block text-xs text-inkSoft mb-1">Score (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={s.score}
                onChange={(e) => updateScore(i, "score", e.target.value)}
                disabled={isLocked}
                className="w-full sm:w-40 rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 disabled:bg-cream"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-inkSoft mb-1">Comment (optional)</label>
              <input
                value={s.comment}
                onChange={(e) => updateScore(i, "comment", e.target.value)}
                disabled={isLocked}
                className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 disabled:bg-cream"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-charcoal mb-1">Overall comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isLocked}
          rows={4}
          className="w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 disabled:bg-cream"
        />
      </div>

      {!isLocked && (
        <div className="flex items-center gap-3">
          <input
            id="finalize"
            type="checkbox"
            checked={finalized}
            onChange={(e) => setFinalized(e.target.checked)}
            className="h-4 w-4 rounded border-charcoal/30 text-orangeDeep focus:ring-orange"
          />
          <label htmlFor="finalize" className="text-sm font-semibold text-charcoal">
            Finalize this evaluation
          </label>
        </div>
      )}

      {isLocked && (
        <div className="rounded-xl bg-green-50 text-green-800 px-4 py-3 text-sm font-semibold">
          This evaluation has been finalized and cannot be edited.
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">Evaluation saved.</p>}

      <div className="flex flex-wrap gap-3">
        {!isLocked && (
          <>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full font-semibold bg-green text-white px-6 py-2.5 hover:bg-navyDeep transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Finalize evaluation"}
            </button>
          </>
        )}
        <Button href={`/judge/hackathons/${hackathon.id}/submissions`} variant="ghost" size="sm">
          Back to submissions
        </Button>
      </div>
    </form>
  );
}
