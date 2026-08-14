"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import ClientDate from "@/components/ClientDate";

interface Commission {
  id: string;
  rate: number;
  platformAmount: number;
  expertAmount: number;
  createdAt: string;
  order: { id: string; orderType: string; amount: number; status: string };
}

export default function AdminCommissionsPage() {
  const [rate, setRate] = useState(0.2);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/commissions");
        const json = await res.json();
        if (res.ok) {
          setRate(json.config?.defaultCommissionRate ?? 0.2);
          setCommissions(json.commissions || []);
        }
      } catch {
        toast.error("Failed to load commissions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/commissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultCommissionRate: Number(rate) }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to save");
        return;
      }
      toast.success("Commission rate updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminHeader
        eyebrow="Payments"
        title="Commissions"
        description="Set the default platform commission rate and review commission records."
        backHref="/admin"
      />

      <AdminCard className="p-5 sm:p-6 mb-8">
        <h2 className="font-display font-bold text-lg text-charcoal mb-4">Default commission rate</h2>
        <form onSubmit={save} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-semibold text-charcoal block mb-1.5">
              Platform commission (0–1)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              required
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save rate"}
          </button>
        </form>
      </AdminCard>

      <AdminDataTable
        title="Commission records"
        count={commissions.length}
        empty={
          !loading && commissions.length === 0 && (
            <div className="p-8 text-center text-inkSoft">No commissions recorded yet.</div>
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
                <th className="px-5 py-3 font-semibold text-charcoal">Type</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Rate</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Platform</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Expert</th>
                <th className="px-5 py-3 font-semibold text-charcoal">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {commissions.map((c) => (
                <tr key={c.id} className="border-b border-charcoal/8 last:border-0">
                  <td className="px-5 py-4 font-semibold text-charcoal">{c.order.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-inkSoft">{c.order.orderType}</td>
                  <td className="px-5 py-4 text-inkSoft">{(c.rate * 100).toFixed(0)}%</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(c.platformAmount / 100).toFixed(2)}</td>
                  <td className="px-5 py-4 text-inkSoft">₹{(c.expertAmount / 100).toFixed(2)}</td>
                  <td className="px-5 py-4 text-inkSoft">
                    <ClientDate date={c.createdAt} />
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
