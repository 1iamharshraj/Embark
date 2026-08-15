"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface PriorityDM {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  responseAt?: string;
  amount: number;
  student: { id: string; name: string; email: string };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  RESPONDED: "Responded",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  EXPIRED: "Expired",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESPONDED: "bg-charcoal/10 text-charcoal",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-red-100 text-red-700",
  EXPIRED: "bg-red-100 text-red-700",
};

export default function ExpertPriorityDmsPage() {
  const [dms, setDms] = useState<PriorityDM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/priority-dms");
        const json = await res.json();
        if (res.ok) {
          setDms(json.dms || []);
        } else {
          toast.error(json.message || "Failed to load priority DMs");
        }
      } catch {
        toast.error("Failed to load priority DMs");
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
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Priority DMs</h1>
        <p className="text-inkSoft text-sm mt-1">Student questions that need your response.</p>
      </div>

      {dms.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 text-center">
          <p className="text-inkSoft">No priority DMs yet.</p>
          <p className="text-xs text-inkSoft/60 mt-1">Questions from students will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
          <div className="divide-y divide-charcoal/8">
            {dms.map((dm) => (
              <div key={dm.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-charcoal truncate">{dm.title}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        STATUS_STYLES[dm.status] || "bg-cream text-inkSoft"
                      }`}
                    >
                      {STATUS_LABELS[dm.status] || dm.status}
                    </span>
                  </div>
                  <p className="text-sm text-inkSoft mt-0.5">{dm.student.name}</p>
                  <p className="text-xs text-inkSoft/60 mt-1">
                    {new Date(dm.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}₹{(dm.amount / 100).toFixed(2)}
                    {dm.responseAt && " · Responded " + new Date(dm.responseAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Link
                  href={`/priority-dms/${dm.id}`}
                  className="shrink-0 text-xs font-semibold text-orangeDeep hover:underline"
                >
                  Open →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
