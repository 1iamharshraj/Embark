"use client";

import Link from "next/link";
import { useState } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  actionLabel: string;
}

const ITEMS: ChecklistItem[] = [
  {
    id: "availability",
    label: "Set your availability",
    description: "Let students know when you're free for sessions.",
    href: "/expert/availability",
    actionLabel: "Set hours",
  },
  {
    id: "services",
    label: "Add services & packages",
    description: "Define what you offer and at what price.",
    href: "/expert/services",
    actionLabel: "Add services",
  },
  {
    id: "page",
    label: "Customise your creator page",
    description: "Add a photo, bio, and headline students see on your public profile.",
    href: "/expert/profile/edit",
    actionLabel: "Edit profile",
  },
  {
    id: "verification",
    label: "Get verified",
    description: "Submit credentials so Embark can approve your public profile.",
    href: "/expert/verification",
    actionLabel: "Verify",
  },
  {
    id: "payouts",
    label: "Set up payouts",
    description: "Add your bank account or UPI to receive earnings.",
    href: "/expert/wallet",
    actionLabel: "Set up payouts",
  },
  {
    id: "whatsapp",
    label: "Add WhatsApp",
    description: "Get booking notifications via WhatsApp.",
    href: "/expert/settings",
    actionLabel: "Add number",
  },
];

const CIRCUMFERENCE = 88;

interface SetupChecklistProps {
  completedIds?: string[];
  percent?: number;
}

export default function SetupChecklist({ completedIds = [], percent }: SetupChecklistProps) {
  const [open, setOpen] = useState(true);

  const doneCount = completedIds.length;
  const totalCount = ITEMS.length;
  const allDone = doneCount >= totalCount;

  const completionPercent = Math.max(0, Math.min(100, percent ?? Math.round((doneCount / totalCount) * 100)));
  const strokeDasharray = `${(completionPercent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream/50 transition"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#F4F7FC"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={allDone ? "#22c55e" : "#FB4D0A"}
                strokeWidth="4"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-charcoal">
              {completionPercent}%
            </span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-charcoal text-sm">
              {allDone ? "Setup complete! 🎉" : "Finish setting up your profile"}
            </p>
            <p className="text-xs text-inkSoft">
              {allDone
                ? "Your profile is ready to receive bookings."
                : `${totalCount - doneCount} step${totalCount - doneCount !== 1 ? "s" : ""} remaining`}
            </p>
          </div>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-5 h-5 text-inkSoft transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Items */}
      {open && (
        <div className="divide-y divide-charcoal/5 border-t border-charcoal/8">
          {ITEMS.map((item) => {
            const done = completedIds.includes(item.id);
            return (
              <div key={item.id} className={`flex items-start gap-4 px-6 py-4 ${done ? "opacity-60" : ""}`}>
                {/* Status circle */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    done
                      ? "bg-green border-green text-white"
                      : "border-charcoal/20 bg-white"
                  }`}
                >
                  {done && (
                    <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                      <path d="M10 3 5 9.5 2 6.5l1.5-1.5 1.5 1.5L8.5 1.5 10 3z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-charcoal">{item.label}</p>
                  <p className="text-xs text-inkSoft mt-0.5">{item.description}</p>
                </div>

                {!done && (
                  <Link
                    href={item.href}
                    className="shrink-0 text-xs font-semibold text-orangeDeep hover:underline"
                  >
                    {item.actionLabel} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
