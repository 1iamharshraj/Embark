"use client";

import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Button";

export interface EvaluationCriterion {
  name: string;
  weight: number;
}

interface EvaluationCriteriaSettingsProps {
  evaluationCriteria: string;
  onEvaluationCriteriaChange: (value: string) => void;
}

function parseCriteria(value: string): EvaluationCriterion[] {
  try {
    const parsed = JSON.parse(value || "{}") as Record<string, unknown>;
    if (Array.isArray(parsed.criteria)) {
      return parsed.criteria
        .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
        .map((c) => ({
          name: typeof c.name === "string" ? c.name : "",
          weight: typeof c.weight === "number" ? c.weight : 0,
        }))
        .filter((c) => c.name);
    }
  } catch {
    // ignore
  }
  return [];
}

export default function EvaluationCriteriaSettings({ evaluationCriteria, onEvaluationCriteriaChange }: EvaluationCriteriaSettingsProps) {
  const initial = useMemo(() => parseCriteria(evaluationCriteria), [evaluationCriteria]);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(initial);

  useEffect(() => {
    setCriteria(initial);
  }, [initial]);

  useEffect(() => {
    const total = criteria.reduce((sum, c) => sum + c.weight, 0);
    const normalized =
      total > 0
        ? criteria.map((c) => ({ ...c, weight: Math.round((c.weight / total) * 100) }))
        : criteria;
    // Adjust rounding errors so total is exactly 100
    if (normalized.length > 0) {
      const normalizedTotal = normalized.reduce((sum, c) => sum + c.weight, 0);
      normalized[0].weight += 100 - normalizedTotal;
    }
    onEvaluationCriteriaChange(JSON.stringify({ criteria: normalized }, null, 2));
  }, [criteria, onEvaluationCriteriaChange]);

  const addCriterion = () => {
    setCriteria([...criteria, { name: "", weight: 0 }]);
  };

  const updateCriterion = (index: number, key: keyof EvaluationCriterion, value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [key]: value };
    setCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const inputClass =
    "w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";
  const labelClass = "block text-xs font-semibold text-charcoal mb-1";

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-inkSoft">
        Define criteria and relative weights. Weights are normalized to 100% on save.
      </p>
      {criteria.map((criterion, i) => (
        <div key={i} className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end border border-charcoal/8 rounded-xl p-4">
          <div>
            <label className={labelClass}>Criterion name</label>
            <input
              value={criterion.name}
              onChange={(e) => updateCriterion(i, "name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Innovation"
            />
          </div>
          <div>
            <label className={labelClass}>Weight</label>
            <input
              type="number"
              min={0}
              value={criterion.weight}
              onChange={(e) => updateCriterion(i, "weight", Number(e.target.value))}
              className={inputClass}
              placeholder="20"
            />
          </div>
          <button
            type="button"
            onClick={() => removeCriterion(i)}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <Button type="button" onClick={addCriterion} variant="ghost" size="sm">
        + Add criterion
      </Button>
      {criteria.length > 0 && (
        <p className="text-sm text-charcoal">
          <strong>Raw total:</strong> {totalWeight} (will be normalized to 100%)
        </p>
      )}
    </div>
  );
}
