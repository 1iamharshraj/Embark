"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/v1/notifications");
    const data = await res.json().catch(() => ({}));
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function markRead(id: string) {
    const res = await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }

  async function markAllRead() {
    const res = await fetch("/api/v1/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }

  function linkFor(n: Notification) {
    if (n.entityType === "Booking" && n.entityId) return `/bookings/${n.entityId}`;
    if (n.entityType === "PriorityDM" && n.entityId) return `/priority-dms/${n.entityId}`;
    if (n.entityType === "ExpertProfile" && n.entityId) return `/expert/${n.entityId}`;
    if (n.entityType === "Hackathon" && n.entityId) return `/competitions/${n.entityId}`;
    return null;
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative p-2 rounded-full hover:bg-cream transition"
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-charcoal"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white ring-2 ring-cream">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-cream/98 backdrop-blur-md border border-charcoal/8 rounded-2xl shadow-[0_14px_40px_rgba(11,31,58,0.16)] z-50 overflow-hidden origin-top-right animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal/8">
            <span className="font-semibold text-charcoal">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-orangeDeep hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-inkSoft text-center">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-inkSoft text-center">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-charcoal/8">
                {notifications.map((n) => {
                  const href = linkFor(n);
                  const content = (
                    <div className="px-4 py-3 hover:bg-orange/5 transition">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                            n.read ? "bg-charcoal/20" : "bg-orange"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${n.read ? "text-charcoal/70" : "text-charcoal"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-inkSoft mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-inkSoft mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <li key={n.id}>
                      {href ? (
                        <Link
                          href={href}
                          onClick={() => !n.read && markRead(n.id)}
                          className="block"
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          onClick={() => !n.read && markRead(n.id)}
                          className="w-full text-left"
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
