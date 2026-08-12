"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export default function ExpertWalletPage() {
  const [balance, setBalance] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("UPI");
  const [accountDetails, setAccountDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/wallet");
        const json = await res.json();
        if (res.ok) {
          setBalance(json.balance || 0);
          setTotalCredit(json.totalCredit || 0);
          setTotalDebit(json.totalDebit || 0);
          setTransactions(json.transactions || []);
        }
      } catch {
        toast.error("Failed to load wallet");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function requestPayout(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(Number(payoutAmount) * 100),
          method: payoutMethod,
          accountDetails: { detail: accountDetails },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to request payout");
        return;
      }
      toast.success("Payout requested");
      setPayoutAmount("");
      setAccountDetails("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <p className="text-inkSoft text-center">Loading wallet...</p>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Eyebrow>Expert wallet</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Earnings & payouts</h1>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Available</div>
              <div className="font-display font-bold text-2xl text-charcoal">₹{(balance / 100).toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Total earnings</div>
              <div className="font-display font-bold text-2xl text-green-700">₹{(totalCredit / 100).toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Withdrawn</div>
              <div className="font-display font-bold text-2xl text-inkSoft">₹{(totalDebit / 100).toFixed(2)}</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Request payout</h2>
              <form onSubmit={requestPayout} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-charcoal">Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-charcoal">Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK">Bank</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-charcoal">Account details</label>
                  <input
                    type="text"
                    required
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    placeholder="UPI ID or account number + IFSC"
                    className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition disabled:opacity-60"
                >
                  {submitting ? "Requesting..." : "Request payout"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-4">Transactions</h2>
              {transactions.length === 0 ? (
                <p className="text-inkSoft text-sm">No transactions yet.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl bg-cream p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-charcoal text-sm">{t.description || t.type}</p>
                        <p className="text-xs text-inkSoft">{new Date(t.createdAt).toLocaleString()}</p>
                      </div>
                      <span
                        className={`font-semibold ${
                          t.type === "CREDIT" ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {t.type === "CREDIT" ? "+" : "-"}₹{(t.amount / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
