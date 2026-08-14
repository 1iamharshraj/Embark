"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const MANAGE_ITEMS: NavItem[] = [
  {
    href: "/expert/dashboard",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/expert/bookings",
    label: "Bookings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/expert/priority-dms",
    label: "Priority DM",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/expert/services",
    label: "Services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/expert/packages",
    label: "Packages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    href: "/expert/availability",
    label: "Calendar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/expert/wallet",
    label: "Payouts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

const PAGE_ITEMS: NavItem[] = [
  {
    href: "/expert/analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/expert/testimonials",
    label: "Testimonials",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: "/expert/profile/edit",
    label: "Edit Public Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
      </svg>
    ),
  },
];

const MORE_ITEMS: NavItem[] = [
  {
    href: "/expert/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/expert/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-orangeDeep/10 text-orangeDeep font-semibold"
          : "text-inkSoft hover:bg-charcoal/5 hover:text-charcoal"
      }`}
    >
      <span className={`shrink-0 ${isActive ? "text-orangeDeep" : "text-inkSoft group-hover:text-charcoal"}`}>
        {item.icon}
      </span>
      {item.label}
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orangeDeep" />
      )}
    </Link>
  );
}

interface ExpertShellProps {
  children: React.ReactNode;
  expertSlug?: string | null;
  expertName?: string;
}

export default function ExpertShell({ children, expertSlug, expertName }: ExpertShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const publicProfileUrl = expertSlug ? `/mentor/${expertSlug}` : null;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top header bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-charcoal/8">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 max-w-screen-2xl mx-auto">
          {/* Left: hamburger on mobile + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-1.5 text-charcoal"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-5 h-5">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Link href="/" className="font-display font-extrabold text-lg text-charcoal tracking-tight">
              e<span className="text-orange">MBA</span>rk
            </Link>
            <span className="hidden sm:inline text-xs font-semibold text-inkSoft bg-cream rounded-full px-3 py-1 border border-charcoal/8">
              Expert Dashboard
            </span>
          </div>

          {/* Right: public profile link */}
          {publicProfileUrl && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-inkSoft">Your page:</span>
              <a
                href={publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-orangeDeep hover:underline"
              >
                {expertSlug}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <button
                type="button"
                title="Copy profile link"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}${publicProfileUrl}`)}
                className="p-1.5 rounded-lg hover:bg-cream text-inkSoft hover:text-charcoal transition"
                aria-label="Copy profile link to clipboard"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          )}

          {!publicProfileUrl && expertName && (
            <p className="text-sm text-inkSoft">Hi, {expertName.split(" ")[0]} 👋</p>
          )}
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-charcoal/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-charcoal/8 flex flex-col gap-1 pt-4 pb-8 px-3 overflow-y-auto transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="mb-2 px-3">
            <p className="text-[10px] font-bold text-inkSoft/60 uppercase tracking-widest">Manage</p>
          </div>
          {MANAGE_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          <div className="mt-5 mb-2 px-3">
            <p className="text-[10px] font-bold text-inkSoft/60 uppercase tracking-widest">Your Page</p>
          </div>
          {PAGE_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          <div className="mt-5 mb-2 px-3">
            <p className="text-[10px] font-bold text-inkSoft/60 uppercase tracking-widest">More</p>
          </div>
          {MORE_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
