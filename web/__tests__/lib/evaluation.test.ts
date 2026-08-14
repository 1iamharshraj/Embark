import {
  calculateWeightedScore,
  calculateAverageScore,
  getAward,
  rankSubmissions,
} from "@/lib/evaluation";

describe("calculateWeightedScore", () => {
  it("calculates a simple weighted average", () => {
    const scores = [
      { score: 80, weight: 1 },
      { score: 90, weight: 1 },
    ];
    expect(calculateWeightedScore(scores)).toBe(85);
  });

  it("respects different weights", () => {
    const scores = [
      { score: 80, weight: 1 },
      { score: 90, weight: 2 },
    ];
    expect(calculateWeightedScore(scores)).toBe(86.67);
  });

  it("returns 0 when total weight is 0", () => {
    expect(calculateWeightedScore([{ score: 80, weight: 0 }])).toBe(0);
  });

  it("rounds to two decimal places", () => {
    const scores = [
      { score: 100, weight: 1 },
      { score: 33, weight: 2 },
    ];
    expect(calculateWeightedScore(scores)).toBe(55.33);
  });
});

describe("calculateAverageScore", () => {
  it("calculates the average of valid scores", () => {
    expect(calculateAverageScore([80, 90, 100])).toBe(90);
  });

  it("ignores null and undefined values", () => {
    expect(calculateAverageScore([80, null, undefined, 100])).toBe(90);
  });

  it("returns 0 for an empty array", () => {
    expect(calculateAverageScore([])).toBe(0);
  });

  it("returns 0 when all values are nullish", () => {
    expect(calculateAverageScore([null, undefined])).toBe(0);
  });

  it("rounds to two decimal places", () => {
    expect(calculateAverageScore([80, 81])).toBe(80.5);
  });
});

describe("getAward", () => {
  it("returns WINNER for rank 1", () => {
    expect(getAward(1)).toBe("WINNER");
  });

  it("returns RUNNER_UP for rank 2", () => {
    expect(getAward(2)).toBe("RUNNER_UP");
  });

  it("returns FINALIST for ranks 3 to 5", () => {
    expect(getAward(3)).toBe("FINALIST");
    expect(getAward(5)).toBe("FINALIST");
  });

  it("returns null for ranks above 5", () => {
    expect(getAward(6)).toBeNull();
  });
});

describe("rankSubmissions", () => {
  it("ranks submissions by average score descending", () => {
    const submissions = [
      { id: "s1", averageScore: 85, hasFinalized: true },
      { id: "s2", averageScore: 92, hasFinalized: true },
      { id: "s3", averageScore: 78, hasFinalized: true },
    ];
    const ranked = rankSubmissions(submissions);
    expect(ranked.map((r) => r.id)).toEqual(["s2", "s1", "s3"]);
    expect(ranked[0]).toMatchObject({ rank: 1, award: "WINNER" });
    expect(ranked[1]).toMatchObject({ rank: 2, award: "RUNNER_UP" });
  });

  it("filters out submissions without finalized evaluations", () => {
    const submissions = [
      { id: "s1", averageScore: 85, hasFinalized: true },
      { id: "s2", averageScore: 0, hasFinalized: false },
    ];
    const ranked = rankSubmissions(submissions);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].id).toBe("s1");
  });
});
