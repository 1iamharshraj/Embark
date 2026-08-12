"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  price: number;
  intakeQuestions: string[] | null;
  expertProfile: { user: { name: string } };
}

export default function BookingPage({ params }: { params: { serviceId: string } }) {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [serviceRes, slotsRes] = await Promise.all([
          fetch(`/api/v1/services/${params.serviceId}`),
          fetch(`/api/v1/availability/slots?serviceId=${params.serviceId}`),
        ]);
        const serviceJson = await serviceRes.json();
        const slotsJson = await slotsRes.json();

        if (!serviceRes.ok) {
          setError(serviceJson.message || "Service not found");
          setLoading(false);
          return;
        }

        setService(serviceJson.service);
        setSlots(slotsJson.slots || []);
      } catch {
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.serviceId]);

  async function submit() {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: params.serviceId,
          scheduledAt: selectedSlot,
          intakeResponses: responses,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to create booking");
        setSubmitting(false);
        return;
      }
      toast.success("Booking created. Proceed to payment.");
      router.push(`/bookings/${json.booking.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <p className="text-inkSoft text-center">Loading...</p>
        </Container>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <p className="text-inkSoft text-center">{error || "Service not found"}</p>
        </Container>
      </section>
    );
  }

  const questions = Array.isArray(service.intakeQuestions) ? (service.intakeQuestions as string[]) : [];

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Book a session</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">{service.name}</h1>
          <p className="text-inkSoft mb-8">
            {service.durationMinutes} min · ₹{(service.price / 100).toFixed(2)} · with {service.expertProfile.user.name}
          </p>

          {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 mb-6">{error}</div>}

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="font-display font-bold text-lg text-charcoal mb-4">Select a slot</h2>
              {slots.length === 0 ? (
                <p className="text-inkSoft">No available slots right now. Check back later.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot) => {
                    const date = new Date(slot.start);
                    const isSelected = selectedSlot === slot.start;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot.start)}
                        className={`text-left rounded-xl border px-4 py-3 transition ${
                          isSelected
                            ? "bg-orangeDeep text-white border-orangeDeep"
                            : "bg-cream border-transparent hover:bg-orange/10"
                        }`}
                      >
                        <div className={`font-semibold ${isSelected ? "text-white" : "text-charcoal"}`}>
                          {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className={`text-sm ${isSelected ? "text-white/90" : "text-inkSoft"}`}>
                          {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {questions.length > 0 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-lg text-charcoal">Intake questions</h2>
                {questions.map((question) => (
                  <div key={question} className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-charcoal">{question}</label>
                    <textarea
                      rows={2}
                      value={responses[question] || ""}
                      onChange={(e) =>
                        setResponses((prev) => ({ ...prev, [question]: e.target.value }))
                      }
                      className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting || !selectedSlot}
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
            >
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
