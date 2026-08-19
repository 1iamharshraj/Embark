"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/Button";

interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to resend verification email.");
        return;
      }
      setSent(true);
      toast.success(data.message || "Verification email sent.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-orangeSoft border border-orange/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <p className="font-semibold text-charcoal">Verify your email address</p>
        <p className="text-sm text-inkSoft mt-0.5">
          Please verify <span className="font-medium text-charcoal">{email}</span> to unlock all features. Check your inbox for the verification link.
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={handleResend}
        disabled={loading || sent}
      >
        {sent ? "Sent" : loading ? "Sending…" : "Resend email"}
      </Button>
    </div>
  );
}
