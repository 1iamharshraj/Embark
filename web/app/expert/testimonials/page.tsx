"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  text: string | null;
  status: string;
  createdAt: string;
  student: { name: string; image?: string | null };
}

export default function ExpertTestimonialsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/reviews?status=PUBLISHED");
        const json = await res.json();
        if (res.ok) {
          setReviews(json.reviews || []);
        } else {
          toast.error(json.message || "Failed to load testimonials");
        }
      } catch {
        toast.error("Failed to load testimonials");
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
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Testimonials</h1>
        <p className="text-inkSoft text-sm mt-1">Reviews from students you&apos;ve helped.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 text-center">
          <p className="text-inkSoft">No published testimonials yet.</p>
          <p className="text-xs text-inkSoft/60 mt-1">Reviews will appear here once students leave them.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-orangeDeep font-bold text-sm">
                  {review.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-charcoal">{review.student.name}</p>
                  <div className="flex text-orange text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                </div>
              </div>
              {review.text && <p className="text-sm text-inkSoft">{review.text}</p>}
              <p className="text-[10px] text-inkSoft/60 mt-3">
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
