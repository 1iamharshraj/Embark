"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import Button from "@/components/Button";

export function LogoutAllButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogoutAll() {
    if (!window.confirm("Log out from all devices? You will need to sign in again on this device.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to log out from all devices.");
        return;
      }
      toast.success(data.message || "Logged out from all devices.");
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogoutAll} disabled={loading}>
      {loading ? "Logging out…" : "Log out from all devices"}
    </Button>
  );
}
