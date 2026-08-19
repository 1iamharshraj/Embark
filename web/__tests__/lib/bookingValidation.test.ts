import { validateBookingSchedule } from "@/lib/bookingValidation";

describe("validateBookingSchedule", () => {
  it("allows times more than 5 minutes in the future", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const scheduledAt = new Date("2026-01-01T12:10:00.000Z");
    const result = validateBookingSchedule(scheduledAt, now);
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it("rejects times in the past", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const scheduledAt = new Date("2026-01-01T11:00:00.000Z");
    const result = validateBookingSchedule(scheduledAt, now);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Booking time must be in the future");
  });

  it("rejects times within the 5-minute buffer", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const scheduledAt = new Date("2026-01-01T12:03:00.000Z");
    const result = validateBookingSchedule(scheduledAt, now);
    expect(result.valid).toBe(false);
  });
});
