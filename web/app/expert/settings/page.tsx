"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ExpertSettingsPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/experts/onboarding");
        const json = (await res.json()) as {
          profile?: { whatsappNumber?: string | null } | null;
        };
        if (res.ok && json.profile?.whatsappNumber) {
          setWhatsapp(json.profile.whatsappNumber.replace(/^\+91/, ""));
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/experts/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: whatsapp ? `+91${whatsapp}` : null,
        }),
      });
      if (res.ok) {
        toast.success("WhatsApp number saved");
      } else {
        const json = await res.json();
        toast.error(json.message || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Settings</h1>
        <p className="text-inkSoft text-sm mt-1">Manage your notification preferences and contact details.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">WhatsApp number</label>
            <p className="text-xs text-inkSoft">Used for booking and DM notifications. Not shown publicly.</p>
            <div className="flex items-center gap-0">
              <span className="inline-flex items-center rounded-l-xl bg-cream border border-r-0 border-transparent px-4 py-3 text-charcoal font-semibold text-sm shrink-0">
                +91
              </span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 rounded-r-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
