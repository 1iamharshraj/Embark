"use client";

import { useState } from "react";
import Button from "@/components/Button";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
  prefill?: { email?: string; name?: string };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CreateOrderResponse {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  dbOrderId: string;
  playbook: { slug: string; name: string; price: number };
}

interface RazorpayButtonProps {
  playbook: { slug: string; name: string; price: number };
  label?: string;
  onSuccess?: () => void;
  className?: string;
  variant?: "primary" | "ghost" | "green" | "light";
  size?: "sm" | "default";
}

export default function RazorpayButton({
  playbook,
  label = `Buy now for ₹${playbook.price}`,
  onSuccess,
  className = "",
  variant = "primary",
  size = "default",
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbookSlug: playbook.slug }),
      });
      const data = (await res.json()) as CreateOrderResponse | { error: string };
      if (!res.ok || !("orderId" in data)) {
        alert("orderId" in data ? "Unexpected response" : data.error || "Could not create order");
        return;
      }

      await loadRazorpayScript();
      if (!window.Razorpay) {
        alert("Razorpay checkout could not be loaded.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Embark India",
        description: playbook.name,
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.dbOrderId,
            }),
          });
          const verifyData = (await verifyRes.json()) as { ok?: boolean; error?: string };
          if (verifyRes.ok && verifyData.ok) {
            onSuccess?.();
          } else {
            alert(verifyData.error || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: "#2E6BFF" },
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant={variant} size={size} className={className}>
      {loading ? "Please wait…" : label}
    </Button>
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-checkout")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}
