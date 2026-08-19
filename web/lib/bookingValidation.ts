export function validateBookingSchedule(
  scheduledAt: Date,
  now: Date = new Date()
): { valid: boolean; message?: string } {
  const minFuture = new Date(now.getTime() + 5 * 60 * 1000);
  if (scheduledAt < minFuture) {
    return { valid: false, message: "Booking time must be in the future" };
  }
  return { valid: true };
}
