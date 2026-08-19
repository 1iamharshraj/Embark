"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import RazorpayButton from "@/components/RazorpayButton";

interface PriorityDM {
  id: string;
  title: string;
  question: string;
  context: string | null;
  response: string | null;
  responseAttachments: string[];
  status: string;
  amount: number;
  dueHours: number;
  createdAt: string;
  responseAt: string | null;
  expert: { id: string; name: string; email: string };
  student: { id: string; name: string; email: string };
}

function getDeadline(dm: PriorityDM) {
  return new Date(new Date(dm.createdAt).getTime() + dm.dueHours * 60 * 60 * 1000);
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return { expired: true as const, text: "Overdue" };
  const totalMinutes = Math.max(0, Math.ceil(diffMs / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const text = days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
  return { expired: false as const, text };
}

function DeadlineBlock({ dm }: { dm: PriorityDM }) {
  const deadline = getDeadline(dm);
  const isDone = ["COMPLETED", "CANCELLED", "REFUNDED", "RESPONDED"].includes(dm.status);
  const countdown = useCountdown(deadline);

  return (
    <div className="rounded-xl bg-cream p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">
        Response deadline
      </div>
      <div className="text-charcoal font-semibold">
        {deadline.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      {!isDone && (
        <div className={`text-sm mt-1 ${countdown.expired ? "text-red-600" : "text-inkSoft"}`}>
          {countdown.expired ? "Response overdue" : `Response due in ${countdown.text}`}
        </div>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
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

export default function PriorityDmDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [dm, setDm] = useState<PriorityDM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/priority-dms/${params.id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.message || "Priority DM not found");
          setLoading(false);
          return;
        }
        setDm(json.dm);
        setResponse(json.dm.response || "");
      } catch {
        setError("Failed to load priority DM");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function submitResponse() {
    if (!response.trim()) {
      toast.error("Please write a response");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/priority-dms/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, status: "RESPONDED" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to submit response");
        return;
      }
      setDm(json.dm);
      toast.success("Response submitted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  async function markComplete() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/priority-dms/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to update");
        return;
      }
      setDm(json.dm);
      toast.success("Marked as completed");
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
          <p className="text-inkSoft text-center">Loading priority DM...</p>
        </Container>
      </section>
    );
  }

  if (!dm) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <p className="text-inkSoft text-center">{error || "Priority DM not found"}</p>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Priority DM</Eyebrow>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">{dm.title}</h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                dm.status === "CANCELLED" || dm.status === "EXPIRED"
                  ? "bg-red-100 text-red-700"
                  : dm.status === "COMPLETED" || dm.status === "RESPONDED"
                  ? "bg-green-100 text-green-700"
                  : "bg-cream text-charcoal"
              }`}
            >
              {STATUS_LABEL[dm.status] || dm.status}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Student</div>
                <div className="text-charcoal font-semibold">{dm.student.name}</div>
                <div className="text-sm text-inkSoft">{dm.student.email}</div>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Expert</div>
                <div className="text-charcoal font-semibold">{dm.expert.name}</div>
                <div className="text-sm text-inkSoft">{dm.expert.email}</div>
              </div>
            </div>

            <div className="rounded-xl bg-cream p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Amount</div>
              <div className="text-charcoal font-semibold">₹{(dm.amount / 100).toFixed(2)}</div>
            </div>

            <DeadlineBlock dm={dm} />

            <div>
              <h2 className="font-display font-bold text-lg text-charcoal mb-2">Question</h2>
              <p className="text-inkSoft whitespace-pre-line">{dm.question}</p>
              {dm.context && (
                <div className="mt-4 rounded-xl bg-cream p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Context</div>
                  <p className="text-charcoal whitespace-pre-line">{dm.context}</p>
                </div>
              )}
            </div>

            {dm.response ? (
              <div className="rounded-xl bg-cream p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display font-bold text-lg text-charcoal">Response</h2>
                  {dm.responseAt && (
                    <span className="text-xs text-inkSoft">
                      {new Date(dm.responseAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-charcoal whitespace-pre-line">{dm.response}</p>
                {dm.responseAttachments.length > 0 && (
                  <div className="mt-4 space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Attachments</div>
                    {dm.responseAttachments.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="text-sm text-orange hover:underline block">
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-cream p-5">
                <h2 className="font-display font-bold text-lg text-charcoal mb-3">Expert response</h2>
                <p className="text-inkSoft text-sm">The expert has not responded yet.</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t border-charcoal/8">
              {dm.status === "PENDING_PAYMENT" && (
                <RazorpayButton
                  order={{
                    orderType: "PRIORITY_DM",
                    relatedId: dm.id,
                    name: dm.title,
                    label: `Pay ₹${(dm.amount / 100).toFixed(2)}`,
                  }}
                  onSuccess={() => {
                    toast.success("Payment successful");
                    router.refresh();
                  }}
                />
              )}
              {dm.status !== "PENDING_PAYMENT" && !dm.response && (
                <>
                  <textarea
                    rows={4}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                  />
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={submitResponse}
                    className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-60"
                  >
                    {actionLoading ? "Submitting..." : "Submit response"}
                  </button>
                </>
              )}
              {dm.response && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={markComplete}
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-green-600 text-white px-5 py-2.5 hover:bg-green-700 transition disabled:opacity-60"
                >
                  Mark completed
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
