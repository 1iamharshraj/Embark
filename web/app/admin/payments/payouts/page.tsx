"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

interface Payout {
  id: string;
  amount: number;
  method: string;
  status: string;
  accountDetails: Record<string, unknown>;
  processedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/payouts");
        const json = await res.json();
        if (res.ok) setPayouts(json.payouts || []);
      } catch {
        toast.error("Failed to load payouts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/v1/payouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to update payout");
        return;
      }
      toast.success(`Payout ${status.toLowerCase()}`);
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status, processedAt: status === "PROCESSED" ? new Date().toISOString() : p.processedAt } : p))
      );
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Eyebrow>Organiser dashboard</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Payouts</h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 overflow-x-auto">
            {loading ? (
              <p className="text-inkSoft">Loading...</p>
            ) : payouts.length === 0 ? (
              <p className="text-inkSoft">No payout requests yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-charcoal/8">
                    <th className="py-2 pr-4">Expert</th>
                    <th className="py-2 pr-4">Method</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Details</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-charcoal/8 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-charcoal">{payout.user.name}</td>
                      <td className="py-3 pr-4 text-inkSoft">{payout.method}</td>
                      <td className="py-3 pr-4 text-inkSoft">₹{(payout.amount / 100).toFixed(2)}</td>
                      <td className="py-3 pr-4 text-inkSoft text-xs max-w-xs truncate">
                        {JSON.stringify(payout.accountDetails)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            payout.status === "PROCESSED"
                              ? "bg-green-100 text-green-700"
                              : payout.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-orangeSoft text-orangeDeep"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {payout.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateStatus(payout.id, "PROCESSED")}
                              className="text-xs font-semibold bg-green-100 text-green-700 rounded-full px-3 py-1.5 hover:bg-green-200 transition"
                            >
                              Process
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(payout.id, "REJECTED")}
                              className="text-xs font-semibold bg-red-100 text-red-700 rounded-full px-3 py-1.5 hover:bg-red-200 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
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
