"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import ClientDate from "@/components/ClientDate";

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
    <>
      <AdminHeader
        eyebrow="Payments"
        title="Payouts"
        description="Review and process expert payout requests."
        backHref="/admin"
      />

      <AdminDataTable
        title="Payout requests"
        count={payouts.length}
        empty={
          !loading && payouts.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No payout requests yet.</div>
          )
        }
      >
        {loading ? (
          <div className="p-8 text-center text-inkSoft">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-charcoal/8">
              <tr className="text-left text-inkSoft">
                <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Method</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Amount</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Details</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Requested</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-charcoal/8 last:border-0">
                  <td className="px-5 py-4 font-semibold text-charcoal">
                    <div>{payout.user.name}</div>
                    <div className="text-xs text-inkSoft">{payout.user.email}</div>
                  </td>
                  <td className="px-5 py-4 text-inkSoft">{payout.method}</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(payout.amount / 100).toFixed(2)}</td>
                  <td className="px-5 py-4 text-inkSoft text-xs max-w-xs truncate">
                    {JSON.stringify(payout.accountDetails)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={payout.status} />
                  </td>
                  <td className="px-5 py-4 text-inkSoft">
                    <ClientDate date={payout.createdAt} />
                  </td>
                  <td className="px-5 py-4">
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
      </AdminDataTable>
    </>
  );
}
