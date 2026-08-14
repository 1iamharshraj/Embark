"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/ReviewList";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import ClientDate from "@/components/ClientDate";

const statusClass: Record<string, string> = {
  PENDING: "bg-orangeSoft text-orangeDeep",
  PUBLISHED: "bg-green-100 text-green-700",
  HIDDEN: "bg-gray-100 text-gray-600",
  REMOVED: "bg-red-100 text-red-700",
};

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
    <>
      <AdminHeader
        eyebrow="Marketplace"
        title="Review moderation"
        description="Approve, hide or remove expert reviews."
        backHref="/admin/marketplace"
      />

      <AdminCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-bold text-xl text-charcoal">Reviews</h2>
            <p className="text-sm text-inkSoft mt-1">Moderate submitted reviews.</p>
          </div>
          <div className="flex flex-wrap gap-2">
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
                      <StatusBadge
                        status={review.status}
                        className={statusClass[review.status]}
                      />
                    </div>
                    <p className="text-charcoal text-sm mb-3">
                      {review.text || "No written review."}
                    </p>
                    <div className="text-xs text-inkSoft">
                      By <span className="font-semibold text-charcoal">{review.student.name}</span> · for{" "}
                      <span className="font-semibold text-charcoal">{review.expert.name}</span> ·{" "}
                      <ClientDate date={review.createdAt} />
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
      </AdminCard>
    </>
  );
}
