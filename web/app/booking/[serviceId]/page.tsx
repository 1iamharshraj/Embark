"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { FadeIn, SkeletonPulse } from "@/components/motion";
import SuccessState from "@/components/illustrations/SuccessState";

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
  const [success, setSuccess] = useState(false);
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

        // Track service view for analytics
        if (serviceJson.service?.expertProfile?.user?.id) {
          fetch("/api/v1/analytics/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "SERVICE_VIEW",
              expertId: serviceJson.service.expertProfile.user.id,
              serviceId: params.serviceId,
            }),
          }).catch(() => {
            // Silently ignore analytics tracking errors
          });
        }
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
      setSuccess(true);
      setTimeout(() => {
        router.push(`/bookings/${json.booking.id}`);
        router.refresh();
      }, 1400);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SkeletonPulse className="h-8 w-48 rounded mb-4" />
            <SkeletonPulse className="h-12 w-full rounded mb-2" />
            <SkeletonPulse className="h-6 w-2/3 rounded mb-8" />
            <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4">
              <SkeletonPulse className="h-6 w-32 rounded" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonPulse key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
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
  const step = questions.length > 0 ? (selectedSlot ? (Object.keys(responses).length === questions.length ? 3 : 2) : 1) : (selectedSlot ? 2 : 1);
  const totalSteps = questions.length > 0 ? 3 : 2;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <Eyebrow>Book a session</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">{service.name}</h1>
            <p className="text-inkSoft mb-8">
              {service.durationMinutes} min · ₹{(service.price / 100).toFixed(2)} · with {service.expertProfile.user.name}
            </p>
          </FadeIn>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 mb-6"
            >
              {error}
            </motion.div>
          )}

          <FadeIn direction="up" delay={0.1}>
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm font-semibold text-charcoal mb-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <span key={i} className={step >= i + 1 ? "text-orangeDeep" : "text-inkSoft/70"}>
                    {i === 0 && "Select slot"}
                    {i === 1 && (questions.length > 0 ? "Questions" : "Confirm")}
                    {i === 2 && "Confirm"}
                  </span>
                ))}
              </div>
              <div className="h-2 bg-cream rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orangeDeep rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
                />
              </div>
            </div>
          </FadeIn>

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
                      <motion.button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot.start)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={isSelected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`text-left rounded-xl border px-4 py-3 transition ${
                          isSelected
                            ? "bg-orangeDeep text-white border-orangeDeep shadow-md"
                            : "bg-cream border-transparent hover:bg-orange/10"
                        }`}
                      >
                        <div className={`font-semibold ${isSelected ? "text-white" : "text-charcoal"}`}>
                          {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className={`text-sm ${isSelected ? "text-white/90" : "text-inkSoft"}`}>
                          {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            <AnimatePresence>
              {questions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
              <AnimatePresence>
                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="hidden sm:block text-sm text-inkSoft"
                  >
                    <span className="font-semibold text-charcoal">{service.durationMinutes} min</span> session selected
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                type="button"
                onClick={submit}
                disabled={submitting || !selectedSlot}
                whileHover={{ scale: selectedSlot ? 1.02 : 1 }}
                whileTap={{ scale: selectedSlot ? 0.98 : 1 }}
                className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
              >
                {submitting ? "Booking..." : "Confirm booking"}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 backdrop-blur-sm p-6"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm w-full"
                >
                  <div className="mx-auto mb-6">
                    <SuccessState />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-2">Booking confirmed</h2>
                  <p className="text-inkSoft text-sm">Redirecting to payment...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
