import Link from "next/link";

const serviceLinks = [
  { href: "/mentorship", label: "Mentorship" },
  { href: "/competitions", label: "Case competitions" },
  { href: "/guest-lectures", label: "Guest lectures" },
  { href: "/playbooks", label: "Stream playbooks" },
];

const involvedLinks = [
  { href: "/invite-expert", label: "Invite an expert" },
  { href: "/become-speaker", label: "Become a speaker" },
  { href: "/mentorship", label: "Book a free intro call" },
  { href: "/auth/signin", label: "Sign in / My account" },
  { href: "/admin", label: "Organiser admin" },
];

export default function Footer() {
  return (
    <footer className="bg-[#101010] text-cream/85 relative overflow-hidden mt-auto">
      <svg
        className="block w-full h-[90px] mb-6"
        viewBox="0 0 1200 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="fp-line"
          d="M-20 70 C 180 20, 360 85, 560 48 S 920 12, 1128 44"
          fill="none"
          stroke="rgba(244,247,252,0.35)"
          strokeWidth="2.5"
          strokeDasharray="9 10"
          strokeLinecap="round"
        />
        <g transform="translate(1128 44)">
          <path d="M0 2V-30" stroke="#F4F7FC" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M0 -29h21l-6.2 6.6 6.2 6.6H0z" fill="#2E6BFF" />
        </g>
      </svg>
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap justify-between gap-10 items-start">
          <div className="max-w-[340px]">
            <Link
              href="/"
              className="font-display font-extrabold text-xl text-cream tracking-tight"
              aria-label="Embark India home"
            >
              e<span className="text-orange">MBA</span>rk
            </Link>
            <p className="text-sm text-cream/60 leading-relaxed mt-3 mb-5">
              Where tier-2 MBA talent builds proof — case competitions, end-to-end mentorship, guest lectures and stream playbooks, all in one place.
            </p>
            <div className="flex gap-2.5" aria-label="Social links">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-xl border border-cream/20 flex items-center justify-center hover:bg-[#0A66C2] hover:border-transparent hover:-translate-y-1 transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.16h4.56V23H.22zM8.34 8.16h4.37v2.02h.06c.61-1.15 2.1-2.37 4.32-2.37 4.62 0 5.47 3.04 5.47 6.99V23h-4.55v-7.21c0-1.72-.03-3.93-2.4-3.93-2.4 0-2.77 1.87-2.77 3.8V23h-3z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl border border-cream/20 flex items-center justify-center hover:border-transparent hover:-translate-y-1 transition"
                style={{ background: "transparent" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                  <circle cx="12" cy="12" r="4.4" />
                  <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-xl border border-cream/20 flex items-center justify-center hover:bg-black hover:border-cream/50 hover:-translate-y-1 transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-10 h-10 rounded-xl border border-cream/20 flex items-center justify-center hover:bg-red-600 hover:border-transparent hover:-translate-y-1 transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.85 12 3.85 12 3.85s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.5 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.5zM9.6 15.57V8.43L15.83 12z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-cream/45 mb-3">
                Services
              </h4>
              <ul className="space-y-2">
                {serviceLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-cream/85 hover:text-white transition relative after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:rounded-sm after:bg-orange after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-cream/45 mb-3">
                Get involved
              </h4>
              <ul className="space-y-2">
                {involvedLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-cream/85 hover:text-white transition relative after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:rounded-sm after:bg-orange after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-cream/45 mb-3">
                Connect
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:hello@embarkindia.in"
                    className="text-sm text-cream/85 hover:text-white transition"
                  >
                    hello@embarkindia.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-dashed border-cream/20 flex flex-wrap justify-between gap-3 text-sm text-cream/50">
          <span>© 2026 Embark India. All rights reserved.</span>
          <span>Made for every aspirant who starts before they feel ready.</span>
        </div>
      </div>
    </footer>
  );
}
