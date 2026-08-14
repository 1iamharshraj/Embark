export interface WeightedScoreInput {
  score: number;
  weight: number;
}

export function calculateWeightedScore(scores: WeightedScoreInput[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

export function calculateAverageScore(scores: (number | null | undefined)[]): number {
  const valid = scores.filter((s): s is number => typeof s === "number" && !Number.isNaN(s));
  if (valid.length === 0) return 0;
  const average = valid.reduce((sum, s) => sum + s, 0) / valid.length;
  return Math.round(average * 100) / 100;
}

export function getAward(rank: number): string | null {
  if (rank === 1) return "WINNER";
  if (rank === 2) return "RUNNER_UP";
  if (rank <= 5) return "FINALIST";
  return null;
}

export type RankableSubmission = {
  id: string;
  averageScore: number;
  hasFinalized: boolean;
};

export type RankedSubmission<T extends RankableSubmission = RankableSubmission> = T & {
  rank: number;
  award: string | null;
};

export function rankSubmissions<T extends RankableSubmission>(submissions: T[]): RankedSubmission<T>[] {
  const scored = submissions
    .filter((sub) => sub.hasFinalized)
    .sort((a, b) => b.averageScore - a.averageScore);

  return scored.map((sub, index) => ({
    ...sub,
    rank: index + 1,
    award: getAward(index + 1),
  }));
}
