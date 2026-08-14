"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/mentorship", label: "Mentorship" },
  { href: "/account/achievements", label: "Achievements" },
  { href: "/account/requests", label: "Requests" },
];

function isActive(href: string, pathname: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountNav() {
  const pathname = usePathname() || "";

  return (
    <nav className="lg:sticky lg:top-8 lg:self-start">
      <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-orange/40",
                active
                  ? "bg-white text-orangeDeep shadow-[0_1px_3px_rgba(22,22,22,0.06)] lg:border-l-4 lg:border-orangeDeep"
                  : "text-charcoal hover:bg-white/60 hover:text-charcoal"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
