"use client";

import { useEffect } from "react";

export default function ProfileViewTracker({ expertId }: { expertId: string }) {
  useEffect(() => {
    fetch("/api/v1/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "PROFILE_VIEW", expertId }),
    }).catch(() => {
      // Silently ignore analytics tracking errors
    });
  }, [expertId]);

  return null;
}
