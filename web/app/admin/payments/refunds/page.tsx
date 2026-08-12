"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

interface Refund {
  id: string;
  amount: number;
  reason: string | null;
  status: string;
  razorpayRefundId: string | null;
  processedAt: string | null;
  createdAt: string;
  order: { id: string; amount: number; orderType: string };
}

function RefundPageInner() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/refunds");
        const json = await res.json();
        if (res.ok) setRefunds(json.refunds || []);
      } catch {
        toast.error("Failed to load refunds");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason,
          amount: amount ? Math.round(Number(amount) * 100) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to create refund");
        return;
      }
      toast.success("Refund initiated");
      setOrderId("");
      setReason("");
      setAmount("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Eyebrow>Organiser dashboard</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Refunds</h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mb-8">
            <h2 className="font-display font-bold text-lg text-charcoal mb-4">Initiate refund</h2>
            <form onSubmit={submit} className="grid sm:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-charcoal">Order ID</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-charcoal">Amount (₹, optional)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-charcoal">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="sm:col-span-3 inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition disabled:opacity-60"
              >
                {submitting ? "Processing..." : "Initiate refund"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 overflow-x-auto">
            <h2 className="font-display font-bold text-lg text-charcoal mb-4">Refund history</h2>
            {loading ? (
              <p className="text-inkSoft">Loading...</p>
            ) : refunds.length === 0 ? (
              <p className="text-inkSoft">No refunds yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-charcoal/8">
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Reason</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="border-b border-charcoal/8 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-charcoal">{refund.order.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4 text-inkSoft">₹{(refund.amount / 100).toFixed(2)}</td>
                      <td className="py-3 pr-4 text-inkSoft">{refund.reason || "—"}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            refund.status === "PROCESSED"
                              ? "bg-green-100 text-green-700"
                              : refund.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-orangeSoft text-orangeDeep"
                          }`}
                        >
                          {refund.status}
                        </span>
                      </td>
                      <td className="py-3 text-inkSoft">
                        {refund.processedAt ? new Date(refund.processedAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function AdminRefundsPage() {
  return (
    <Suspense fallback={<div className="bg-cream py-16 sm:py-24"><Container><p className="text-inkSoft text-center">Loading...</p></Container></div>}>
      <RefundPageInner />
    </Suspense>
  );
}
