"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "./NotificationBell";

const publicLinks = [
  { href: "/mentorship", label: "Mentorship" },
  { href: "/competitions", label: "Competitions" },
  { href: "/guest-lectures", label: "Guest lectures" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/mba-colleges-tamilnadu", label: "MBA colleges" },
];

const expertTools = [
  { href: "/expert/dashboard", label: "Dashboard" },
  { href: "/expert/bookings", label: "Bookings" },
  { href: "/expert/priority-dms", label: "Priority DMs" },
  { href: "/expert/services", label: "Services" },
  { href: "/expert/packages", label: "Packages" },
  { href: "/expert/availability", label: "Availability" },
  { href: "/expert/wallet", label: "Wallet" },
  { href: "/expert/analytics", label: "Analytics" },
  { href: "/expert/testimonials", label: "Testimonials" },
  { href: "/expert/profile/edit", label: "Profile" },
  { href: "/expert/account", label: "Account" },
  { href: "/expert/settings", label: "Settings" },
];

function AnimatedLogo() {
  const letters = [
    { char: "e", className: "text-charcoal" },
    { char: "M", className: "text-orange" },
    { char: "B", className: "text-orange" },
    { char: "A", className: "text-orange" },
    { char: "r", className: "text-charcoal" },
    { char: "k", className: "text-charcoal" },
  ];

  return (
    <Link
      href="/"
      className="group relative font-display font-extrabold text-xl tracking-tight pr-3 inline-flex items-baseline"
      aria-label="Embark India home"
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          className={`inline-block transition-transform duration-300 ease-out group-hover:animate-logo-bounce ${letter.className}`}
          style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
        >
          {letter.char}
        </span>
      ))}
      <svg
        className="absolute -top-2 right-0 w-3.5 h-4 opacity-0 -translate-y-2 -rotate-[18deg] group-hover:opacity-100 group-hover:translate-y-0 group-hover:rotate-0 transition"
        viewBox="0 0 13 15"
        aria-hidden="true"
      >
        <path d="M1.5 15V1" stroke="#161616" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M1.5 1.2h9.5l-2.8 3 2.8 3H1.5z" fill="#2E6BFF" />
      </svg>
    </Link>
  );
}

function AccountLink({
  session,
  onClick,
  className = "inline-flex items-center justify-center rounded-full border-[1.5px] border-charcoal/25 text-charcoal font-semibold text-sm px-5 py-2.5 hover:border-charcoal transition",
}: {
  session: Session | null | undefined;
  onClick?: () => void;
  className?: string;
}) {
  const isExpert = session?.user?.roles?.includes("Expert");
  const href = isExpert ? "/expert/dashboard" : "/account";
  const label = isExpert ? "Expert dashboard" : "My account";
  return (
    <Link href={href} onClick={onClick} className={className}>
      {label}
    </Link>
  );
}

function ExpertToolsDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className={`relative text-sm font-medium pb-1 inline-flex items-center gap-1.5 transition after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-[3px] after:rounded-sm after:bg-orange after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition ${
          open ? "text-navy after:scale-x-100" : "text-inkSoft hover:text-navy"
        }`}
      >
        Expert tools
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-4 w-64 bg-cream/97 backdrop-blur-md border border-charcoal/8 rounded-2xl shadow-[0_14px_40px_rgba(11,31,58,0.16)] p-3 z-50">
          <div className="grid gap-1">
            {expertTools.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="block text-sm font-medium text-charcoal px-3 py-2 rounded-xl hover:bg-orange/8 hover:text-orangeDeep transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isExpert = session?.user?.roles?.includes("Expert") ?? false;
  const isExpertContext = isExpert && pathname?.startsWith("/expert");

  return (
    <nav className="sticky top-3 z-50 px-3">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-5 bg-cream/85 backdrop-blur-md border border-charcoal/8 rounded-full shadow-[0_6px_24px_rgba(11,31,58,0.08)]">
        <div className="flex items-center gap-4">
          <AnimatedLogo />
          {isExpertContext ? (
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-navy border-[1.5px] border-navy/40 rounded-full px-3 py-1 tracking-wide hover:bg-navy/5 transition"
            >
              Back to site <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className="hidden sm:inline-flex text-xs font-semibold text-green border-[1.5px] border-green rounded-full px-3 py-1 tracking-wide">
              MBA guidance + competitions
            </span>
          )}
        </div>

        <ul className="hidden lg:flex items-center gap-6 ml-auto">
          {isExpertContext ? (
            <li>
              <ExpertToolsDropdown onNavigate={() => setOpen(false)} />
            </li>
          ) : (
            publicLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="relative text-sm font-medium text-inkSoft hover:text-navy transition pb-1 after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-[3px] after:rounded-sm after:bg-orange after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition"
                >
                  {l.label}
                </Link>
              </li>
            ))
          )}
        </ul>

        {session ? (
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-charcoal/10">
            <NotificationBell />
            <AccountLink session={session} />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center justify-center rounded-full font-semibold text-sm px-5 py-2.5 text-red-700 hover:bg-red-50 transition"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-charcoal/10">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border-[1.5px] border-charcoal/25 text-charcoal font-semibold text-sm px-5 py-2.5 hover:border-charcoal transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white text-sm px-5 py-2.5 hover:bg-[#1740A8] transition"
            >
              Start free
            </Link>
          </div>
        )}

        <button
          className="lg:hidden p-2 text-charcoal"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          {open ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="w-6 h-6"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="w-6 h-6"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="lg:hidden mt-2 mx-auto max-w-6xl bg-cream/97 backdrop-blur-md border border-charcoal/8 rounded-[22px] shadow-[0_14px_40px_rgba(11,31,58,0.16)] p-3">
          {isExpertContext && (
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block text-navy font-semibold text-base px-4 py-3 rounded-xl hover:bg-navy/5 transition"
            >
              ← Back to public site
            </Link>
          )}

          {isExpertContext ? (
            <div className="grid grid-cols-2 gap-1 py-2">
              {expertTools.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm font-medium text-charcoal px-4 py-3 rounded-xl hover:bg-orange/8 hover:text-orangeDeep transition"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ) : (
            publicLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-charcoal font-semibold text-base px-4 py-3 rounded-xl hover:bg-orange/8 hover:text-orangeDeep"
              >
                {l.label}
              </Link>
            ))
          )}

          {session ? (
            <>
              <div className="border-t border-charcoal/8 my-2" />
              <AccountLink
                session={session}
                onClick={() => setOpen(false)}
                className="block text-charcoal font-semibold text-base px-4 py-3 rounded-xl hover:bg-orange/8 hover:text-orangeDeep"
              />
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-charcoal font-semibold text-base">Notifications</span>
                <NotificationBell />
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="block w-full text-left text-red-700 font-semibold text-base px-4 py-3 rounded-xl hover:bg-red-50 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-charcoal/8 my-2" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block text-charcoal font-semibold text-base px-4 py-3 rounded-xl hover:bg-orange/8 hover:text-orangeDeep"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="block text-white font-semibold text-base px-4 py-3 rounded-xl bg-orangeDeep hover:bg-[#1740A8] transition"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
