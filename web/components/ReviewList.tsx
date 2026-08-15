"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type ReviewItem = {
  id: string;
  rating: number;
  text: string | null;
  createdAt: string;
  student: { name: string; image: string | null };
};

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`w-4 h-4 ${filled ? "text-orange" : "text-charcoal/20"}`}
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= Math.round(rating)} />
      ))}
    </div>
  );
}

export default function ReviewList({ expertUserId }: { expertUserId: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/reviews?expertId=${expertUserId}&status=PUBLISHED`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .finally(() => setLoading(false));
  }, [expertUserId]);

  if (loading) return <p className="text-sm text-inkSoft">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="text-sm text-inkSoft">No reviews yet.</p>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl bg-white border border-charcoal/8 p-4 transition hover:shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-sm font-semibold text-charcoal">
              {review.student.image ? (
                <Image
                  src={review.student.image}
                  alt={review.student.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="36px"
                />
              ) : (
                review.student.name.charAt(0)
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-charcoal">{review.student.name}</div>
              <StarRating rating={review.rating} />
            </div>
          </div>
          {review.text && <p className="text-inkSoft text-sm">{review.text}</p>}
        </div>
      ))}
    </div>
  );
}
