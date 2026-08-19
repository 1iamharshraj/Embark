"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import NotificationBell from "@/components/NotificationBell";

interface ExpertWorkspaceShellProps {
  children: React.ReactNode;
}

type NavItem = {
  href: string;
  label: string;
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Hub",
    items: [{ href: "/expert/dashboard", label: "Overview" }],
  },
  {
    title: "My Public Page",
    items: [
      { href: "/expert/profile/edit", label: "Profile" },
      { href: "/expert/profile/about", label: "About" },
      { href: "/expert/profile/experience", label: "Experience" },
      { href: "/expert/profile/education", label: "Education" },
      { href: "/expert/profile/expertise", label: "Expertise" },
      { href: "/expert/profile/testimonials", label: "Testimonials" },
      { href: "/expert/profile/appearance", label: "Page Appearance" },
    ],
  },
  {
    title: "Services",
    items: [
      { href: "/expert/services", label: "1:1 Sessions" },
      { href: "/expert/priority-dms", label: "Priority DM" },
      { href: "/expert/packages", label: "Packages" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/expert/bookings", label: "Bookings" },
      { href: "/expert/availability", label: "Calendar" },
      { href: "/expert/customers", label: "Students / Customers" },
      { href: "/expert/priority-dms", label: "Priority DMs" },
    ],
  },
  {
    title: "Monetise",
    items: [
      { href: "/expert/packages", label: "Packages" },
      { href: "/expert/earnings", label: "Earnings" },
      { href: "/expert/testimonials", label: "Reviews & Testimonials" },
    ],
  },
  {
    title: "Grow",
    items: [
      { href: "/expert/analytics", label: "Analytics" },
      { href: "/expert/notifications", label: "Notifications" },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/expert/account", label: "Account" },
      { href: "/expert/settings", label: "General" },
      { href: "/expert/settings/calendar", label: "Calendar" },
      { href: "/expert/settings/payments", label: "Payments" },
      { href: "/expert/settings/notifications", label: "Notifications" },
      { href: "/expert/settings/security", label: "Security" },
    ],
  },
];

function isActive(href: string, pathname: string) {
  if (href === "/expert/dashboard") return pathname === "/expert/dashboard";
  return pathname.startsWith(href);
}

function Logo() {
  return (
    <Link
      href="/expert/dashboard"
      className="font-display font-extrabold text-xl text-charcoal inline-flex items-baseline shrink-0"
      aria-label="Expert dashboard"
    >
      <span className="text-charcoal">e</span>
      <span className="text-orange">MBA</span>
      <span className="text-charcoal">rk</span>
      <span className="ml-2 text-xs font-semibold text-inkSoft uppercase tracking-wider hidden sm:inline">
        Expert hub
      </span>
    </Link>
  );
}

function TopNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "";
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    if (openGroup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openGroup]);

  return (
    <div ref={containerRef} className="hidden lg:flex items-center gap-0.5 xl:gap-1">
      {groups.map((group) => {
        const active = group.items.some((item) => isActive(item.href, pathname));
        const isOpen = openGroup === group.title;
        return (
          <div
            key={group.title}
            className="relative group"
            onMouseEnter={() => setOpenGroup(group.title)}
            onMouseLeave={() => setOpenGroup(null)}
          >
            <button
              onClick={() => setOpenGroup(isOpen ? null : group.title)}
              aria-expanded={isOpen}
              className={cn(
                "flex items-center gap-1 px-2 xl:px-3 py-2 text-sm font-medium rounded-xl transition whitespace-nowrap",
                active
                  ? "text-orangeDeep bg-orangeSoft/80 shadow-sm"
                  : "text-inkSoft hover:text-charcoal hover:bg-white/60"
              )}
            >
              {group.title}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  isOpen ? "rotate-180" : ""
                )}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Mega-menu dropdown — always rendered so CSS hover can reveal it even if JS state lags */}
            <div
              data-testid={`expert-nav-dropdown-${group.title}`}
              aria-hidden={!isOpen}
              className={cn(
                "absolute top-full left-0 pt-2 z-50 min-w-[20rem] xl:min-w-[22rem]",
                "opacity-0 invisible translate-y-1",
                "group-hover:opacity-100 group-hover:visible group-hover:translate-y-0",
                isOpen ? "opacity-100 visible translate-y-0" : "",
                "transition-all duration-200 ease-out"
              )}
            >
              <div className="bg-white/95 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_24px_60px_rgba(11,31,58,0.18)] p-5">
                <div className="relative">
                  <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider mb-3">{group.title}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    {group.items.map((item) => {
                      const itemActive = isActive(item.href, pathname);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            setOpenGroup(null);
                            onNavigate?.();
                          }}
                          className={cn(
                            "text-sm py-2 px-2 rounded-lg transition",
                            itemActive ? "text-orangeDeep font-semibold bg-orangeSoft" : "text-charcoal hover:bg-cream"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() || "";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-charcoal/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white/[0.96] backdrop-blur-2xl border-r border-white/40 shadow-[0_14px_40px_rgba(11,31,58,0.16)] flex flex-col transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-charcoal/8 flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 text-charcoal hover:bg-cream rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider mb-2 px-3">{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "block rounded-xl px-3 py-2 text-sm font-semibold transition",
                          active ? "bg-orangeSoft text-orangeDeep" : "text-charcoal hover:bg-cream"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}

export default function ExpertWorkspaceShell({ children }: ExpertWorkspaceShellProps) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() || "";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top workspace bar with mega-menu nav — liquid-glass shell */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-white/60 shadow-[0_8px_32px_rgba(11,31,58,0.08)]">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/80 via-white/40 to-white/20" />
        <div className="relative max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 -ml-2 text-charcoal hover:bg-cream rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Logo />
            </div>

            <TopNav onNavigate={() => setMobileOpen(false)} />

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-navy border border-navy/30 rounded-full px-3 py-1.5 hover:bg-navy/5 transition"
              >
                Back to site <span aria-hidden="true">→</span>
              </Link>
              <NotificationBell />
              <div className="hidden md:flex items-center gap-2 pl-2 sm:pl-3 border-l border-charcoal/10">
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "E"}
                </div>
                <div className="hidden lg:block min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate max-w-[120px]">
                    {session?.user?.name || "Expert"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center rounded-full font-semibold text-sm px-3 py-2 text-red-700 hover:bg-red-50 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
