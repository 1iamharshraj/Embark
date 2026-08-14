import { calculateCommission } from "@/lib/commission";

describe("calculateCommission", () => {
  it("splits amount into platform and expert portions", () => {
    const result = calculateCommission(1000, 0.2);
    expect(result.platformAmount).toBe(200);
    expect(result.expertAmount).toBe(800);
    expect(result.rate).toBe(0.2);
  });

  it("rounds platform amount to nearest integer", () => {
    const result = calculateCommission(999, 0.25);
    expect(result.platformAmount).toBe(250);
    expect(result.expertAmount).toBe(749);
  });

  it("returns full amount to expert when rate is zero", () => {
    const result = calculateCommission(500, 0);
    expect(result.platformAmount).toBe(0);
    expect(result.expertAmount).toBe(500);
  });
});
