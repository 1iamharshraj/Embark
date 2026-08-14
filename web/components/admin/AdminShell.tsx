"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface AdminShellProps {
  children: React.ReactNode;
}

const groups = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Admin centre" },
      { href: "/admin/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Content & events",
    items: [
      { href: "/admin/competitions", label: "Competitions" },
      { href: "/admin/hackathons", label: "Hackathons" },
      { href: "/admin/playbooks", label: "Playbooks" },
      { href: "/admin/lectures", label: "Lectures" },
      { href: "/admin/speakers", label: "Speakers" },
    ],
  },
  {
    title: "Mentorship",
    items: [
      { href: "/admin/mentorship", label: "Bookings" },
      { href: "/admin/experts", label: "Experts" },
      { href: "/admin/marketplace", label: "Marketplace" },
      { href: "/admin/lecture-requests", label: "Lecture requests" },
      { href: "/admin/speaker-applications", label: "Speaker apps" },
    ],
  },
  {
    title: "Payments",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/payments/transactions", label: "Transactions" },
      { href: "/admin/payments/refunds", label: "Refunds" },
      { href: "/admin/payments/commissions", label: "Commissions" },
      { href: "/admin/payments/payouts", label: "Payouts" },
    ],
  },
  {
    title: "Users & access",
    items: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/roles", label: "Roles" },
      { href: "/admin/permissions", label: "Permissions" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/audit-logs", label: "Audit logs" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

function isActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-charcoal/8 flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-5 border-b border-charcoal/8 flex items-center justify-between">
          <Link href="/admin" className="font-display font-extrabold text-xl text-charcoal">
            e<span className="text-orangeDeep">MBA</span>rk
          </Link>
          <button
            className="lg:hidden p-1 text-inkSoft hover:text-charcoal transition"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider mb-2 px-3">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname || "");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                          active
                            ? "bg-orangeSoft text-orangeDeep shadow-sm"
                            : "text-charcoal hover:bg-cream"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-orangeDeep hidden lg:block" />
                        )}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-charcoal/8">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-cream/70">
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-charcoal truncate">{session?.user?.name || "Admin"}</p>
              <p className="text-xs text-inkSoft truncate">{session?.user?.email || ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 text-center rounded-xl px-3 py-2 text-xs font-semibold text-charcoal bg-cream border border-charcoal/12 hover:bg-white transition"
            >
              Exit admin
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex-1 text-center rounded-xl px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-charcoal/8 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
            className="p-2 -ml-2 text-charcoal hover:bg-cream rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display font-extrabold text-lg text-charcoal">
            e<span className="text-orangeDeep">MBA</span>rk
          </span>
          <div className="w-8" />
        </div>
        <main className="py-8 px-4 sm:px-6 lg:py-12 lg:px-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
