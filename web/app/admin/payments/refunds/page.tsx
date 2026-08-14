"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import ClientDate from "@/components/ClientDate";

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
    <>
      <AdminHeader
        eyebrow="Payments"
        title="Refunds"
        description="Initiate refunds and view the refund history."
        backHref="/admin"
      />

      <AdminCard className="p-5 sm:p-6 mb-8">
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
      </AdminCard>

      <AdminDataTable
        title="Refund history"
        count={refunds.length}
        empty={
          !loading && refunds.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No refunds yet.</div>
          )
        }
      >
        {loading ? (
          <div className="p-8 text-center text-inkSoft">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-charcoal/8">
              <tr className="text-left text-inkSoft">
                <th className="px-5 py-3 font-semibold text-charcoal">Order</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Amount</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Reason</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {refunds.map((refund) => (
                <tr key={refund.id} className="border-b border-charcoal/8 last:border-0">
                  <td className="px-5 py-4 font-semibold text-charcoal">{refund.order.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(refund.amount / 100).toFixed(2)}</td>
                  <td className="px-5 py-4 text-inkSoft">{refund.reason || "—"}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={refund.status} />
                  </td>
                  <td className="px-5 py-4 text-inkSoft">
                    {refund.processedAt ? <ClientDate date={refund.processedAt} /> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminDataTable>
    </>
  );
}

export default function AdminRefundsPage() {
  return (
    <Suspense fallback={<div className="py-12"><p className="text-inkSoft text-center">Loading...</p></div>}>
      <RefundPageInner />
    </Suspense>
  );
}
