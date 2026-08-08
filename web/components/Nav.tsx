"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

const links = [
  { href: "/mentorship", label: "Mentorship" },
  { href: "/competitions", label: "Competitions" },
  { href: "/guest-lectures", label: "Guest lectures" },
  { href: "/playbooks", label: "Playbooks" },
];

export default function Nav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-3 z-50 px-3">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-5 bg-cream/85 backdrop-blur-md border border-charcoal/8 rounded-full shadow-[0_6px_24px_rgba(11,31,58,0.08)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="relative font-display font-extrabold text-xl text-charcoal tracking-tight pr-3"
            aria-label="Embark India home"
          >
            e<span className="text-orange">MBA</span>rk
            <svg
              className="absolute -top-2 right-0 w-3.5 h-4 opacity-0 -translate-y-2 -rotate-[18deg] group-hover:opacity-100 group-hover:translate-y-0 group-hover:rotate-0 transition"
              viewBox="0 0 13 15"
              aria-hidden="true"
            >
              <path d="M1.5 15V1" stroke="#161616" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M1.5 1.2h9.5l-2.8 3 2.8 3H1.5z" fill="#2E6BFF" />
            </svg>
          </Link>
          <span className="hidden sm:inline-flex text-xs font-semibold text-green border-[1.5px] border-green rounded-full px-3 py-1 tracking-wide">
            MBA guidance + competitions
          </span>
        </div>

        <ul className="hidden lg:flex items-center gap-7 ml-auto">
          {links.map((l) => (
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

        <Link
          href={session ? "/account" : "/auth/signin"}
          className="hidden lg:inline-flex items-center justify-center rounded-full border-[1.5px] border-charcoal/25 text-charcoal font-semibold text-sm px-5 py-2.5 hover:border-charcoal transition"
        >
          {session ? "My account" : "Sign in"}
        </Link>

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
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-charcoal font-semibold text-base px-4 py-3 rounded-xl hover:bg-orange/8 hover:text-orangeDeep"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={session ? "/account" : "/auth/signin"}
            onClick={() => setOpen(false)}
            className="block text-charcoal font-semibold text-base px-4 py-3 rounded-xl hover:bg-orange/8 hover:text-orangeDeep"
          >
            {session ? "My account" : "Sign in"}
          </Link>
        </div>
      )}
    </nav>
  );
}
