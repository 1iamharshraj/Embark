"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

const publicLinks = [
  { href: "/mentorship", label: "Mentorship" },
  { href: "/competitions", label: "Competitions" },
  { href: "/guest-lectures", label: "Guest lectures" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/mba-colleges-tamilnadu", label: "MBA colleges" },
];

const manageItems = [
  { href: "/expert/dashboard", label: "Dashboard" },
  { href: "/expert/bookings", label: "Bookings" },
  { href: "/expert/priority-dms", label: "Priority DM" },
  { href: "/expert/services", label: "Services" },
  { href: "/expert/packages", label: "Packages" },
  { href: "/expert/availability", label: "Calendar" },
  { href: "/expert/wallet", label: "Payouts" },
];

const pageItems = [
  { href: "/expert/analytics", label: "Analytics" },
  { href: "/expert/testimonials", label: "Testimonials" },
  { href: "/expert/profile/edit", label: "Edit Public Profile" },
];

const moreItems = [
  { href: "/expert/settings", label: "Settings" },
  { href: "/expert/account", label: "Account" },
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

function MegaMenu({ close }: { close: () => void }) {
  return (
    <div
      className="absolute top-full right-0 mt-3 w-[520px] max-w-[92vw] bg-white/97 backdrop-blur-md border border-charcoal/8 rounded-[22px] shadow-[0_14px_48px_rgba(11,31,58,0.16)] p-6 animate-mega-in origin-top-right"
      onMouseLeave={close}
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-inkSoft/60 uppercase tracking-widest mb-3">Manage</p>
          <ul className="space-y-0.5">
            {manageItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block text-charcoal font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-orange/8 hover:text-orangeDeep transition truncate"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold text-inkSoft/60 uppercase tracking-widest mb-3">Your Page</p>
          <ul className="space-y-0.5">
            {pageItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block text-charcoal font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-orange/8 hover:text-orangeDeep transition truncate"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col min-w-0">
          <div>
            <p className="text-[10px] font-bold text-inkSoft/60 uppercase tracking-widest mb-3">More</p>
            <ul className="space-y-0.5">
              {moreItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block text-charcoal font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-orange/8 hover:text-orangeDeep transition truncate"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto pt-5">
            <div className="p-4 rounded-2xl bg-cream border border-charcoal/8">
              <p className="font-display font-bold text-charcoal text-sm">Need help?</p>
              <p className="text-xs text-inkSoft mt-1 leading-relaxed">Visit your dashboard for tips and setup guidance.</p>
              <Link
                href="/expert/dashboard"
                onClick={close}
                className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-orangeDeep hover:underline"
              >
                Go to dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const isExpert = session?.user?.roles?.includes("Expert");
  // Show expert nav mode when: user is an expert AND currently on an /expert/* page
  const showExpertNav = isExpert && pathname?.startsWith("/expert");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    }
    if (megaOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [megaOpen]);

  return (
    <nav className="sticky top-3 z-50 px-3">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-5 bg-cream/85 backdrop-blur-md border border-charcoal/8 rounded-full shadow-[0_6px_24px_rgba(11,31,58,0.08)]">
        <div className="flex items-center gap-4">
          <AnimatedLogo />
          <span className="hidden sm:inline-flex text-xs font-semibold text-green border-[1.5px] border-green rounded-full px-3 py-1 tracking-wide">
            MBA guidance + competitions
          </span>
        </div>

        {showExpertNav ? (
          <>
            <ul className="hidden lg:flex items-center gap-6 ml-auto">
              <li>
                <Link
                  href="/"
                  className="relative text-sm font-medium text-inkSoft hover:text-navy transition pb-1 after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-[3px] after:rounded-sm after:bg-orange after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition"
                >
                  Back to home
                </Link>
              </li>
            </ul>

            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-charcoal/10">
              <NotificationBell />
              <div ref={megaRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMegaOpen((s) => !s)}
                  onMouseEnter={() => setMegaOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orangeDeep/10 text-orangeDeep font-semibold text-sm px-5 py-2.5 hover:bg-orangeDeep/20 transition"
                >
                  Expert dashboard
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`w-3.5 h-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {megaOpen && <MegaMenu close={() => setMegaOpen(false)} />}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center rounded-full font-semibold text-sm px-5 py-2.5 text-red-700 hover:bg-red-50 transition"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <ul className="hidden lg:flex items-center gap-6 ml-auto">
              {publicLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="relative text-sm font-medium text-inkSoft hover:text-navy transition pb-1 after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-[3px] after:rounded-sm after:bg-orange after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {session ? (
              <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-charcoal/10">
                <NotificationBell />
                {isExpert && (
                  <Link
                    href="/expert/dashboard"
                    className="inline-flex items-center justify-center rounded-full bg-orangeDeep/10 text-orangeDeep font-semibold text-sm px-5 py-2.5 hover:bg-orangeDeep/20 transition"
                  >
                    Expert dashboard
                  </Link>
                )}
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center rounded-full border-[1.5px] border-charcoal/25 text-charcoal font-semibold text-sm px-5 py-2.5 hover:border-charcoal transition"
                >
                  My account
                </Link>
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
          </>
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
          {showExpertNav ? (
            <>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block text-charcoal font-semibold text-base px-4 py-3 rounded-xl hover:bg-orange/8 hover:text-orangeDeep"
              >
                ← Back to home
              </Link>
              <div className="px-4 py-2 mt-2 text-[10px] font-bold text-inkSoft/60 uppercase tracking-widest">Expert dashboard</div>
              {[...manageItems, ...pageItems, ...moreItems].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-charcoal font-medium text-base px-4 py-2.5 rounded-xl hover:bg-orange/8 hover:text-orangeDeep"
                >
                  {item.label}
                </Link>
              ))}
            </>
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
