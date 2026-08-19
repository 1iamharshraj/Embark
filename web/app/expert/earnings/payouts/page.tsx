"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ClientDate from "@/components/ClientDate";

interface Payout {
  id: string;
  amount: number;
  method: string;
  status: string;
  accountDetails: Record<string, unknown>;
  processedAt: string | null;
  createdAt: string;
}

export default function ExpertPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/payouts");
        const json = await res.json();
        if (res.ok) setPayouts(json.payouts || []);
        else toast.error(json.error || "Failed to load payouts");
      } catch {
        toast.error("Failed to load payouts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Earnings</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Payouts</h1>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-charcoal">Payout history</h2>
              <Link
                href="/expert/wallet"
                className="text-sm font-semibold text-orangeDeep hover:underline"
              >
                Request payout →
              </Link>
            </div>

            {loading ? (
              <p className="text-inkSoft text-center">Loading...</p>
            ) : payouts.length === 0 ? (
              <p className="text-inkSoft text-center">No payouts yet.</p>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="rounded-xl bg-cream p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-charcoal">
                        ₹{(payout.amount / 100).toFixed(2)} · {payout.method}
                      </p>
                      <p className="text-xs text-inkSoft">
                        Requested{" "}
                        <ClientDate date={payout.createdAt} options={{ dateStyle: "medium" }} />
                        {payout.processedAt && (
                          <>
                            {" "}
                            · Processed{" "}
                            <ClientDate date={payout.processedAt} options={{ dateStyle: "medium" }} />
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 self-start ${
                        payout.status === "PROCESSED"
                          ? "bg-green-100 text-green-700"
                          : payout.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-cream text-charcoal border border-charcoal/12"
                      }`}
                    >
                      {payout.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
