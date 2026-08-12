"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ToggleServiceProps {
  serviceId: string;
  initialIsActive: boolean;
}

export default function ToggleService({ serviceId, initialIsActive }: ToggleServiceProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to update");
        return;
      }
      setIsActive(!isActive);
      toast.success(isActive ? "Service suspended" : "Service activated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-60 ${
        isActive
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {loading ? "..." : isActive ? "Active" : "Suspended"}
    </button>
  );
}
