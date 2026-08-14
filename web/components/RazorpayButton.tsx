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
  name?: string;
  mock?: boolean;
  playbook?: { slug: string; name: string; price: number };
}

interface GenericOrderItem {
  orderType: "PLAYBOOK" | "MENTORSHIP" | "BOOKING" | "PRIORITY_DM" | "PACKAGE" | "HACKATHON_FEE";
  relatedId: string;
  name?: string;
  label?: string;
}

interface RazorpayButtonProps {
  type?: "playbook" | "mentorship";
  playbook?: { slug: string; name: string; price: number };
  bookingRequestId?: string;
  order?: GenericOrderItem;
  label?: string;
  onSuccess?: () => void;
  className?: string;
  variant?: "primary" | "ghost" | "green" | "light";
  size?: "sm" | "default";
}

export default function RazorpayButton({
  type: typeProp,
  playbook,
  bookingRequestId,
  order,
  label,
  onSuccess,
  className = "",
  variant = "primary",
  size = "default",
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const legacyType = typeProp ?? (bookingRequestId ? "mentorship" : playbook ? "playbook" : undefined);
  const itemName = order?.name ?? (legacyType === "mentorship" ? playbook?.name ?? "Mentorship" : playbook?.name ?? "");
  const displayLabel = label ?? order?.label ?? (legacyType === "mentorship" ? `Pay now for ${itemName}` : `Buy now for ₹${playbook?.price ?? 0}`);

  async function handleClick() {
    if (order) {
      if (!order.orderType || !order.relatedId) {
        alert("Order details missing.");
        return;
      }
    } else {
      if (legacyType === "playbook" && !playbook?.slug) {
        alert("Playbook details missing.");
        return;
      }
      if (legacyType === "mentorship" && !bookingRequestId) {
        alert("Booking details missing.");
        return;
      }
    }

    setLoading(true);
    try {
      let body: string;
      let createUrl: string;
      let verifyUrl: string;

      if (order) {
        createUrl = "/api/v1/orders";
        verifyUrl = "/api/v1/payments/verify";
        body = JSON.stringify({ orderType: order.orderType, relatedId: order.relatedId });
      } else {
        createUrl = "/api/orders/create";
        verifyUrl = "/api/orders/verify";
        body =
          legacyType === "mentorship"
            ? JSON.stringify({ type: "mentorship", bookingRequestId })
            : JSON.stringify({ type: "playbook", playbookSlug: playbook!.slug });
      }

      const res = await fetch(createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = (await res.json()) as CreateOrderResponse | { error: string };
      if (!res.ok || !("orderId" in data)) {
        alert("orderId" in data ? "Unexpected response" : data.error || "Could not create order");
        return;
      }

      // Mock mode: skip Razorpay checkout and mark paid immediately.
      if (data.mock) {
        const verifyRes = await fetch(verifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: `mock_payment_${data.dbOrderId}`,
            razorpay_order_id: data.orderId,
            razorpay_signature: "mock_signature",
            dbOrderId: data.dbOrderId,
          }),
        });
        const verifyData = (await verifyRes.json()) as { ok?: boolean; error?: string };
        if (verifyRes.ok && verifyData.ok) {
          onSuccess?.();
        } else {
          alert(verifyData.error || "Mock payment verification failed.");
        }
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
        description: data.name || itemName,
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch(verifyUrl, {
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
      {loading ? "Please wait…" : displayLabel}
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
