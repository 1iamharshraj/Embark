"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timeZone: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AvailabilityManagerProps {
  expertProfileId: string;
  initial: Availability[];
}

export default function AvailabilityManager({ expertProfileId, initial }: AvailabilityManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<Availability[]>(initial);
  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    timeZone: "Asia/Kolkata",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const start = form.startTime.replace(" ", "");
    const end = form.endTime.replace(" ", "");

    try {
      const res = await fetch("/api/v1/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertProfileId,
          dayOfWeek: form.dayOfWeek,
          startTime: start,
          endTime: end,
          timeZone: form.timeZone,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to add availability");
        setLoading(false);
        return;
      }
      setItems((prev) =>
        [...prev, json.availability].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        )
      );
      toast.success("Availability added");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this availability?")) return;
    try {
      const res = await fetch(`/api/v1/availability/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message || "Failed to delete");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Availability removed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="space-y-8">
      {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <form onSubmit={add} className="bg-cream rounded-2xl p-5 sm:p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg text-charcoal">Add weekly hours</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Day</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
              className="w-full rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            >
              {DAYS.map((day, i) => (
                <option key={day} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Start time</label>
            <input
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
              className="w-full rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">End time</label>
            <input
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
              className="w-full rounded-xl bg-white border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add availability"}
        </button>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-inkSoft text-center py-8">
            No availability set. Add hours so students can book slots.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-charcoal">{DAYS[item.dayOfWeek]}</p>
                <p className="text-sm text-inkSoft">
                  {item.startTime} – {item.endTime} · {item.timeZone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-2"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
