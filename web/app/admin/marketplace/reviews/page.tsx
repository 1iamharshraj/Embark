"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StarRating } from "@/components/ReviewList";

type Review = {
  id: string;
  rating: number;
  text: string | null;
  status: string;
  createdAt: string;
  student: { name: string; email: string };
  expert: { name: string; email: string };
  booking?: { id: string; status: string } | null;
  dm?: { id: string; status: string } | null;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/reviews?status=${filter}`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/v1/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Failed to update review");
    }
    setUpdating(null);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-charcoal">Review moderation</h1>
        <Link
          href="/admin/marketplace"
          className="text-sm font-semibold text-orangeDeep hover:underline"
        >
          Back to marketplace
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {["PENDING", "PUBLISHED", "HIDDEN", "REMOVED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === s
                ? "bg-orangeDeep text-white"
                : "bg-cream text-charcoal hover:bg-orange/10"
            }`}
          >
            {s.toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-inkSoft">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-inkSoft">No {filter.toLowerCase()} reviews.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-charcoal/8 rounded-xl p-5 transition hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-inkSoft">
                      {review.status}
                    </span>
                  </div>
                  <p className="text-charcoal text-sm mb-3">{review.text || "No written review."}</p>
                  <div className="text-xs text-inkSoft">
                    By <span className="font-semibold text-charcoal">{review.student.name}</span> · for{" "}
                    <span className="font-semibold text-charcoal">{review.expert.name}</span> ·{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filter !== "PUBLISHED" && (
                    <button
                      onClick={() => updateStatus(review.id, "PUBLISHED")}
                      disabled={updating === review.id}
                      className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                  {filter !== "HIDDEN" && (
                    <button
                      onClick={() => updateStatus(review.id, "HIDDEN")}
                      disabled={updating === review.id}
                      className="px-4 py-2 rounded-full text-sm font-semibold bg-cream text-charcoal hover:bg-orange/10 transition disabled:opacity-50"
                    >
                      Hide
                    </button>
                  )}
                  {filter !== "REMOVED" && (
                    <button
                      onClick={() => updateStatus(review.id, "REMOVED")}
                      disabled={updating === review.id}
                      className="px-4 py-2 rounded-full text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
