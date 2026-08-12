"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PurchaseButtonProps {
  packageId: string;
}

export default function PurchaseButton({ packageId }: PurchaseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/package-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to purchase package");
        setLoading(false);
        return;
      }
      toast.success("Package purchased");
      router.push("/account");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePurchase}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
    >
      {loading ? "Purchasing..." : "Purchase"}
    </button>
  );
}
