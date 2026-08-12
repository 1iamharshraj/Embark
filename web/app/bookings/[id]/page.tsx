"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import RazorpayButton from "@/components/RazorpayButton";

interface Booking {
  id: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  amount: number;
  cancellationReason: string | null;
  meetingLink: string | null;
  intakeResponses: Record<string, string> | null;
  service: { id: string; name: string; durationMinutes: number | null; price: number; intakeQuestions: string[] | null };
  client: { id: string; name: string; email: string };
  expert: { id: string; name: string; email: string };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  CONFIRMED: "Confirmed",
  RESCHEDULE_REQUESTED: "Reschedule requested",
  RESCHEDULED: "Rescheduled",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  REFUNDED: "Refunded",
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/bookings/${params.id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.message || "Booking not found");
          setLoading(false);
          return;
        }
        setBooking(json.booking);
      } catch {
        setError("Failed to load booking");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function updateStatus(status: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to update booking");
        return;
      }
      setBooking(json.booking);
      toast.success("Booking updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <p className="text-inkSoft text-center">Loading booking...</p>
        </Container>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <p className="text-inkSoft text-center">{error || "Booking not found"}</p>
        </Container>
      </section>
    );
  }

  const scheduled = new Date(booking.scheduledAt);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Booking</Eyebrow>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">{booking.service.name}</h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                  ? "bg-red-100 text-red-700"
                  : booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : "bg-cream text-charcoal"
              }`}
            >
              {STATUS_LABEL[booking.status] || booking.status}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Date & time</div>
                <div className="text-charcoal font-semibold">
                  {scheduled.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
                <div className="text-sm text-inkSoft">
                  {scheduled.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} · {booking.durationMinutes} min
                </div>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Amount</div>
                <div className="text-charcoal font-semibold">₹{(booking.amount / 100).toFixed(2)}</div>
                <div className="text-sm text-inkSoft">{booking.status === "PENDING_PAYMENT" ? "Payment pending" : "Paid"}</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Student</div>
                <div className="text-charcoal font-semibold">{booking.client.name}</div>
                <div className="text-sm text-inkSoft">{booking.client.email}</div>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Expert</div>
                <div className="text-charcoal font-semibold">{booking.expert.name}</div>
                <div className="text-sm text-inkSoft">{booking.expert.email}</div>
              </div>
            </div>

            {booking.meetingLink && (
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Meeting link</div>
                <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-orangeDeep hover:underline break-all">
                  {booking.meetingLink}
                </a>
              </div>
            )}

            {booking.intakeResponses && Object.keys(booking.intakeResponses).length > 0 && (
              <div>
                <h2 className="font-display font-bold text-lg text-charcoal mb-3">Intake responses</h2>
                <div className="space-y-3">
                  {Object.entries(booking.intakeResponses).map(([question, answer]) => (
                    <div key={question} className="rounded-xl bg-cream p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">{question}</div>
                      <div className="text-charcoal whitespace-pre-line">{answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.cancellationReason && (
              <div className="rounded-xl bg-red-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-1">Cancellation reason</div>
                <div className="text-red-800">{booking.cancellationReason}</div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t border-charcoal/8">
              {booking.status === "PENDING_PAYMENT" && (
                <>
                  <RazorpayButton
                    order={{
                      orderType: "BOOKING",
                      relatedId: booking.id,
                      name: booking.service.name,
                      label: `Pay ₹${(booking.amount / 100).toFixed(2)}`,
                    }}
                    onSuccess={() => {
                      toast.success("Payment successful");
                      router.refresh();
                    }}
                  />
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => updateStatus("CANCELLED")}
                    className="inline-flex items-center justify-center rounded-full font-semibold bg-red-100 text-red-700 px-5 py-2.5 hover:bg-red-200 transition disabled:opacity-60"
                  >
                    Cancel booking
                  </button>
                </>
              )}
              {booking.status === "CONFIRMED" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => updateStatus("COMPLETED")}
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-60"
                >
                  Mark complete
                </button>
              )}
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-5 py-2.5 hover:bg-orange/10 transition"
              >
                Back to account
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
