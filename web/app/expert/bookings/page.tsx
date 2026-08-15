"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface Booking {
  id: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  amount: number;
  meetingLink?: string;
  service: { name: string; durationMinutes: number; price: number };
  client: { id: string; name: string; email: string };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  CONFIRMED: "Confirmed",
  RESCHEDULED: "Rescheduled",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  RESCHEDULED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-charcoal/10 text-charcoal",
};

export default function ExpertBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/bookings");
        const json = await res.json();
        if (res.ok) {
          setBookings(json.bookings || []);
        } else {
          toast.error(json.message || "Failed to load bookings");
        }
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Bookings</h1>
        <p className="text-inkSoft text-sm mt-1">All your 1:1 sessions and consultations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 text-center">
          <p className="text-inkSoft">No bookings yet.</p>
          <p className="text-xs text-inkSoft/60 mt-1">Students will appear here once they book a session.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
          <div className="divide-y divide-charcoal/8">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-charcoal">{booking.service.name}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        STATUS_STYLES[booking.status] || "bg-cream text-inkSoft"
                      }`}
                    >
                      {STATUS_LABELS[booking.status] || booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-inkSoft mt-0.5">{booking.client.name}</p>
                  <p className="text-xs text-inkSoft/60 mt-1">
                    {new Date(booking.scheduledAt).toLocaleString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {booking.durationMinutes} min · ₹{(booking.amount / 100).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {booking.meetingLink && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-orangeDeep hover:underline"
                    >
                      Join →
                    </a>
                  )}
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="text-xs font-semibold text-charcoal hover:text-orange"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
