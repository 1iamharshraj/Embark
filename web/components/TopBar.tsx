export default function TopBar() {
  return (
    <div className="bg-orange text-white text-[0.82rem] font-semibold">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-5">
        <div className="flex items-center gap-6">
          <a
            href="mailto:info@embarkindia.in"
            className="inline-flex items-center gap-2 text-white hover:opacity-80 transition"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <span className="hidden sm:inline">info@embarkindia.in</span>
          </a>
          <a
            href="tel:+919789052921"
            className="inline-flex items-center gap-2 text-white hover:opacity-80 transition"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
            </svg>
            <span>+91 9789052921</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:info@embarkindia.in?subject=Free%20Consultation"
            className="hidden sm:inline-flex items-center gap-2 bg-white text-orangeDeep font-bold text-xs px-4 py-1.5 rounded-full shadow-md hover:-translate-y-0.5 transition"
          >
            <span>Book a Free Consultation</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </a>
          <div className="hidden md:flex items-center gap-2">
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/35 transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.5 8.3A1.8 1.8 0 1 0 6.5 4.7a1.8 1.8 0 0 0 0 3.6ZM5 9.6h3v9.4H5zM10 9.6h2.9v1.3h.1c.4-.8 1.5-1.6 3-1.6 3.1 0 3.7 2 3.7 4.7V19h-3v-4.4c0-1 0-2.4-1.5-2.4s-1.7 1.2-1.7 2.3V19h-3z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/35 transition"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="X"
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/35 transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/35 transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.85 12 3.85 12 3.85s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.5 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.5zM9.6 15.57V8.43L15.83 12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
