# Project Overview

## Product definition

**Embark India** is a web platform for MBA students, especially those from Tier‑2 B‑schools in India. It is positioned as a "career operating system" that helps students move from confusion to clarity across their MBA journey.

### Target audience

- Primary: **Tier‑2 MBA students** in India
- Secondary: MBA aspirants, final‑year students, recent graduates
- Users include students looking for competitions, mentors, stream guidance, guest lectures, and placement preparation

### Brand voice

- Sharp, confident, mentor‑like
- Practical, no‑fluff advice
- Tagline theme: **"Start before you feel ready."**

### Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| Accent (bright) | `#2E6BFF` | Primary buttons, links, highlights |
| Deep | `#1D4ED8` | Button hover, emphasis |
| Soft | `#E5EDFF` | Tints, backgrounds |
| Cream | `#F4F7FC` | Page background |
| Charcoal | `#161616` | Primary text |
| Ink soft | `#6B7280` | Secondary text |
| Navy | `#0B1F3A` | Dark sections, footer |
| Navy deep | `#08172B` | Navy hover/deep |
| Fonts | Bricolage Grotesque + Inter | Display + body |

> **Note:** The static site CSS still uses `--orange` variable names from an earlier orange palette, but they now hold blue values.

## The eight intended services

| # | Service | Static site status | Next.js status |
|---|---------|--------------------|----------------|
| 1 | **Case competitions** | ✅ Built and functional (Supabase auth, registration, submissions, admin, winners, RLS) | ✅ Built and functional |
| 2 | Mentorship | 🟡 Static marketing page, hardcoded mentors | ✅ Built (booking + payments) |
| 3 | Jobs & internships | ❌ Not built | ❌ Not built |
| 4 | Courses | ❌ Not built | ❌ Not built |
| 5 | Guest lecture as a service | 🟡 Static page + forms, no backend | ✅ Built (speaker applications + lecture requests) |
| 6 | Mock interviews & GDs | ❌ Not built | ❌ Not built |
| 7 | Stream playbooks | ✅ Built (hardcoded content) | ✅ Built (DB + Razorpay checkout) |
| 8 | Blog | ❌ Not built | ❌ Not built |

## Current state (as of 2026-08-08)

- The **static site** is still live at `embarkindia.in` on Hostinger.
- The **Next.js app** in `web/` is feature-complete locally and passes all verification scripts.
- All major money features in the Next.js app now have real backends:
  - Case competitions with registration, submissions, advancement, winners, certificates
  - Playbook shop with Razorpay test-mode checkout
  - Mentorship booking requests with payment
  - Speaker applications and guest-lecture requests
- Main blockers before public launch:
  1. Razorpay is still in **test mode**.
  2. Password-reset emails are only **logged to console**.
  3. File storage uses a **local fallback** in dev.
  4. Database is local Docker; production needs **Neon**.
  5. DNS still points to Hostinger; needs **Vercel** cutover.
  6. `npm audit` reports high-severity issues in build-time/framework packages.

## Repository structure

```
EmbarkIndia/
├── .html files              ← legacy static site pages (must stay at root)
├── css/gl.css               ← shared stylesheet for static site
├── js/*.js                  ← static site scripts (db, nav, mentors, playbooks)
├── supabase/*.sql           ← Supabase schema and migrations
├── assets/                  ← images, logos, people, posters, vendor libs
├── memory/                  ← persistent AI memory
├── Agentic config/          ← migration planning docs
├── design-source/           ← Word docs (gitignored, not deployed)
├── web/                     ← Next.js 14 PWA rebuild
│   ├── app/                 ← App Router routes
│   ├── components/          ← shared React components
│   ├── lib/                 ← Prisma, auth, storage, Razorpay helpers
│   ├── prisma/              ← schema, migrations, seed
│   ├── public/              ← PWA manifest, icons, offline page
│   ├── scripts/             ← verification and helper scripts
│   └── docker-compose.yml
└── docs/                    ← this documentation
```

## Key decisions

- **Keep the database on Supabase** for the static site; do not move it to Hostinger shared hosting.
- **Use Prisma + PostgreSQL** for the Next.js app.
- **NextAuth.js v4** with credentials provider and bcrypt.
- **Razorpay** for Indian payments (UPI, cards, netbanking).
- **Cloudflare R2** for production file storage.
- **Vercel** for Next.js deployment.
- **PWA** via `next-pwa` for installable app experience.

## Founder / admin

- Founder email: `ajay.san36@gmail.com`
- Admin access is hardcoded by email in both Supabase (`schema.sql`) and Next.js (`/api/auth/register`).
