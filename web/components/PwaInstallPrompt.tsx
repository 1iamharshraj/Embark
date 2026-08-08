"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
    setDismissed(true);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy text-cream px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium">Install Embark India for quick access</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="text-sm font-semibold bg-orange text-white rounded-lg px-4 py-2 hover:bg-orangeDeep transition"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-sm font-semibold text-cream/70 hover:text-cream px-3 py-2"
            aria-label="Dismiss install prompt"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
