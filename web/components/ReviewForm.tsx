"use client";

import { useState } from "react";

interface ReviewFormProps {
  bookingId?: string;
  dmId?: string;
  onSubmitted?: () => void;
}

export default function ReviewForm({ bookingId, dmId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/v1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        dmId,
        rating,
        text: text.trim() || undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.message || "Failed to submit review.");
    } else {
      setSuccess(true);
      onSubmitted?.();
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 text-green-800 p-4 text-sm">
        Thanks! Your review has been submitted and is pending approval.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-charcoal mb-2">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Rate ${i} stars`}
            >
              <svg
                viewBox="0 0 20 20"
                className={`w-7 h-7 ${(hover || rating) >= i ? "text-orange" : "text-charcoal/20"}`}
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-text" className="block text-sm font-semibold text-charcoal mb-2">
          Review
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition"
          placeholder="Share your experience…"
          maxLength={2000}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
