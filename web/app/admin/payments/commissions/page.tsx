"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

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
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Eyebrow>Organiser dashboard</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Commissions</h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mb-8">
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
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 overflow-x-auto">
            <h2 className="font-display font-bold text-lg text-charcoal mb-4">Commission records</h2>
            {loading ? (
              <p className="text-inkSoft">Loading...</p>
            ) : commissions.length === 0 ? (
              <p className="text-inkSoft">No commissions recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-charcoal/8">
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Rate</th>
                    <th className="py-2 pr-4">Platform</th>
                    <th className="py-2">Expert</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-charcoal/8 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-charcoal">{c.order.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4 text-inkSoft">{c.order.orderType}</td>
                      <td className="py-3 pr-4 text-inkSoft">{(c.rate * 100).toFixed(0)}%</td>
                      <td className="py-3 pr-4 text-inkSoft">₹{(c.platformAmount / 100).toFixed(2)}</td>
                      <td className="py-3 text-inkSoft">₹{(c.expertAmount / 100).toFixed(2)}</td>
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
