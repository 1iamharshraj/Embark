import { certificateTypeLabel } from "@/lib/certificate";

describe("certificateTypeLabel", () => {
  it("formats PARTICIPATION", () => {
    expect(certificateTypeLabel("PARTICIPATION")).toBe("Participation");
  });

  it("formats SPECIAL_RECOGNITION", () => {
    expect(certificateTypeLabel("SPECIAL_RECOGNITION")).toBe("Special Recognition");
  });

  it("formats RUNNER_UP", () => {
    expect(certificateTypeLabel("RUNNER_UP")).toBe("Runner Up");
  });
});
