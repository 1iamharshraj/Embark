"use client";

import { useState } from "react";

const DAYS = [
  { label: "Sunday", short: "Sun", value: 0 },
  { label: "Monday", short: "Mon", value: 1 },
  { label: "Tuesday", short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday", short: "Thu", value: 4 },
  { label: "Friday", short: "Fri", value: 5 },
  { label: "Saturday", short: "Sat", value: 6 },
];

// 15-minute increments from 00:00 to 23:45
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  }
}

function formatTime(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const ampm = hh < 12 ? "AM" : "PM";
  const h = hh % 12 || 12;
  return `${h}:${String(mm).padStart(2, "0")} ${ampm}`;
}

export interface DayAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timeZone: string;
}

interface DayRow {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface AvailabilityStepProps {
  value: DayAvailability[];
  onChange: (value: DayAvailability[]) => void;
}

export default function AvailabilityStep({ value, onChange }: AvailabilityStepProps) {
  // Build initial state from value
  const initial: Record<number, DayRow> = {};
  for (const day of DAYS) {
    const existing = value.find((v) => v.dayOfWeek === day.value);
    initial[day.value] = {
      enabled: !!existing,
      startTime: existing?.startTime ?? "09:00",
      endTime: existing?.endTime ?? "17:00",
    };
  }

  const [rows, setRows] = useState<Record<number, DayRow>>(initial);

  function updateRow(dayValue: number, patch: Partial<DayRow>) {
    const next = { ...rows, [dayValue]: { ...rows[dayValue], ...patch } };
    setRows(next);
    emit(next);
  }

  function applyToAll(dayValue: number) {
    const src = rows[dayValue];
    const next: Record<number, DayRow> = {};
    for (const day of DAYS) {
      next[day.value] = {
        enabled: rows[day.value].enabled,
        startTime: src.startTime,
        endTime: src.endTime,
      };
    }
    setRows(next);
    emit(next);
  }

  function emit(state: Record<number, DayRow>) {
    const result: DayAvailability[] = [];
    for (const day of DAYS) {
      const row = state[day.value];
      if (row.enabled) {
        result.push({
          dayOfWeek: day.value,
          startTime: row.startTime,
          endTime: row.endTime,
          timeZone: "Asia/Kolkata",
        });
      }
    }
    onChange(result);
  }

  return (
    <div className="space-y-3">
      {DAYS.map((day) => {
        const row = rows[day.value];
        return (
          <div
            key={day.value}
            className={`rounded-2xl border transition ${
              row.enabled
                ? "border-orangeDeep/30 bg-orange/5"
                : "border-charcoal/8 bg-white"
            }`}
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Checkbox */}
              <button
                type="button"
                role="checkbox"
                aria-checked={row.enabled}
                onClick={() => updateRow(day.value, { enabled: !row.enabled })}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                  row.enabled
                    ? "bg-orangeDeep border-orangeDeep text-white"
                    : "border-charcoal/25 bg-white"
                }`}
              >
                {row.enabled && (
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                    <path d="M10 3 5 9.5 2 6.5l1.5-1.5 1.5 1.5L8.5 1.5 10 3z" />
                  </svg>
                )}
              </button>

              <span
                className={`font-semibold text-sm w-24 ${
                  row.enabled ? "text-charcoal" : "text-inkSoft"
                }`}
              >
                {day.label}
              </span>

              {row.enabled && (
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <select
                    value={row.startTime}
                    onChange={(e) => updateRow(day.value, { startTime: e.target.value })}
                    className="rounded-lg bg-white border border-charcoal/12 px-2.5 py-1.5 text-sm text-charcoal focus:border-orange outline-none transition"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime(t)}
                      </option>
                    ))}
                  </select>
                  <span className="text-inkSoft text-xs font-medium">to</span>
                  <select
                    value={row.endTime}
                    onChange={(e) => updateRow(day.value, { endTime: e.target.value })}
                    className="rounded-lg bg-white border border-charcoal/12 px-2.5 py-1.5 text-sm text-charcoal focus:border-orange outline-none transition"
                  >
                    {TIME_OPTIONS.filter((t) => t > row.startTime).map((t) => (
                      <option key={t} value={t}>
                        {formatTime(t)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => applyToAll(day.value)}
                    className="ml-auto text-xs font-semibold text-orangeDeep hover:underline"
                  >
                    Apply to all
                  </button>
                </div>
              )}

              {!row.enabled && (
                <span className="text-xs text-inkSoft/60 ml-auto">Unavailable</span>
              )}
            </div>
          </div>
        );
      })}

      {value.length === 0 && (
        <p className="text-xs text-inkSoft text-center py-1">
          Select at least one day to set your availability.
        </p>
      )}
    </div>
  );
}
