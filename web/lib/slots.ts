import { addDays, addMinutes, getDay, startOfDay } from "date-fns";

export interface ServiceAvailability {
  dayOfWeek: number; // 0-6 Sunday-Saturday
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  timeZone: string;
}

export interface BookingSlot {
  start: Date;
  end: Date;
}

function parseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function generateSlots(
  availabilities: ServiceAvailability[],
  durationMinutes: number,
  bufferMinutes = 0,
  existingBookings: Date[] = [],
  weeks = 4,
  fromDate = new Date(),
  blockedDates: Date[] = []
): BookingSlot[] {
  const slots: BookingSlot[] = [];
  const slotLength = durationMinutes + bufferMinutes;

  for (let week = 0; week < weeks; week++) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = addDays(startOfDay(fromDate), week * 7 + dayOffset);
      const dayOfWeek = getDay(date);

      if (blockedDates.some((blocked) => isSameDate(blocked, date))) {
        continue;
      }

      const daySchedules = availabilities.filter((a) => a.dayOfWeek === dayOfWeek);
      for (const schedule of daySchedules) {
        const { hours: startH, minutes: startM } = parseTime(schedule.startTime);
        const { hours: endH, minutes: endM } = parseTime(schedule.endTime);

        let slotStart = new Date(date);
        slotStart.setHours(startH, startM, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(endH, endM, 0, 0);

        while (addMinutes(slotStart, durationMinutes) <= dayEnd) {
          const slotEnd = addMinutes(slotStart, durationMinutes);
          const isBooked = existingBookings.some((bookingStart) =>
            Math.abs(slotStart.getTime() - bookingStart.getTime()) < 1000
          );
          if (!isBooked) {
            slots.push({ start: slotStart, end: slotEnd });
          }
          slotStart = addMinutes(slotStart, slotLength);
        }
      }
    }
  }

  return slots.filter((slot) => slot.start > fromDate);
}
