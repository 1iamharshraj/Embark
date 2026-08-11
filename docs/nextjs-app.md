# Next.js 14 App (`web/`)

The new Embark India application is a full-stack Next.js 14 (App Router) PWA intended to replace the legacy static site.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14.2.35 App Router |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| ORM | Prisma 5 |
| Database | PostgreSQL (local Docker; production Neon) |
| Auth | NextAuth.js v4 credentials + bcrypt |
| Forms | React Hook Form + Zod |
| Payments | Razorpay |
| File storage | Local fallback in dev; Cloudflare R2 in production |
| PWA | `next-pwa` |
| Deploy target | Vercel |

## Project structure

```
web/
├── app/                        ← App Router
│   ├── layout.tsx              ← root shell (fonts, TopBar, Nav, Footer, PWA prompt)
│   ├── page.tsx                ← homepage
│   ├── Providers.tsx           ← SessionProvider + Sonner Toaster
│   ├── globals.css             ← Tailwind base + custom properties
│   ├── sitemap.ts              ← generated sitemap
│   ├── login/                  ← credentials sign-in
│   ├── register/               ← account creation
│   ├── reset-password/         ← request reset link
│   ├── set-password/           ← set new password from token
│   ├── auth/signin/            ← redirect to /login
│   ├── account/                ← user dashboard + sub-pages
│   ├── competitions/           ← public competition list
│   ├── competition/[id]/       ← competition detail + registration/submission
│   ├── admin/                  ← admin dashboard
│   ├── admin/competitions/     ← CRUD + progress + results
│   ├── admin/mentorship/       ← booking management
│   ├── admin/speaker-applications/ ← speaker approval
│   ├── admin/lecture-requests/ ← lecture request management
│   ├── admin/orders/           ← view orders
│   ├── playbooks/              ← playbook shelf
│   ├── playbook/[slug]/        ← playbook reader
│   ├── mentorship/             ← mentor directory
│   ├── mentor/[slug]/          ← mentor profile + booking
│   ├── guest-lectures/         ← guest lecture landing
│   ├── become-a-speaker/       ← speaker application form
│   ├── invite-an-expert/       ← institute lecture request form
│   └── api/                    ← API routes
├── components/                 ← shared React components
├── lib/                        ← Prisma, auth, storage, Razorpay, helpers
├── prisma/                     ← schema, migrations, seed
├── public/                     ← PWA manifest, icons, offline page
├── scripts/                    ← verification + helper scripts
├── docker-compose.yml          ← local Postgres
├── .env.example                ← required environment variables
├── next.config.mjs             ← PWA + legacy HTML redirects
├── tailwind.config.ts          ← design tokens
└── package.json
```

## Configuration

### `next.config.mjs`

- Wrapped with `next-pwa` (dest `public`, skip waiting, disabled in dev).
- `images.unoptimized: true`.
- Redirects legacy `.html` paths to clean routes:
  - `/index.html` → `/`
  - `/competitions.html` → `/competitions`
  - `/competition.html` → `/competitions`
  - `/playbooks.html` → `/playbooks`
  - `/mentorship.html` → `/mentorship`
  - `/account.html` → `/account`
  - `/become-speaker.html` → `/become-a-speaker`
  - `/invite-expert.html` → `/invite-an-expert`
  - `/mentor-profile.html` → `/mentorship`

### `tailwind.config.ts`

Custom colors map the blue design system (names still say "orange" from the old palette):

- `orange`: `#2E6BFF`
- `orangeDeep`: `#1D4ED8`
- `orangeSoft`: `#E5EDFF`
- `cream`: `#F4F7FC`
- `charcoal`: `#161616`
- `inkSoft`: `#6B7280`
- `navy`: `#0B1F3A`
- `navyDeep`: `#08172B`
- `green`: `#0B1F3A`

Font families: `display` (Bricolage Grotesque), `body` (Inter).

### `middleware.ts`

- Public paths allowed without auth: `/login`, `/register`, `/reset-password`, `/set-password`, `/api/*`, `/_next/*`, `/manifest.json`, `/offline.html`, etc.
- `/account/*` redirects unauthenticated users to `/login` with `callbackUrl`.
- `/admin/*` redirects non-admin users to `/account`.

## App routes

### Public marketing routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage: hero carousel, poster/live competition marquees, partner/college marquees, reality grid, impact band, service strip, final CTA |
| `/competitions` | Competition listing with categories and FAQ |
| `/competition/[id]` | Public detail; registration and round submissions for logged-in users |
| `/playbooks` | Playbook shelf (streams + shop) |
| `/playbook/[slug]` | Stream playbook content; shop playbooks gated by purchase; theme-aware hero, chapter bar, skill checklist, do/don’t, colleges |
| `/mentorship` | Mentor directory and marketing |
| `/mentor/[slug]` | Mentor profile with booking form |
| `/guest-lectures` | Guest lecture service overview (hero, logo marquee, flip cards, expertise tabs, speaker carousel, FAQ) |
| `/become-a-speaker` | Speaker application form |
| `/invite-an-expert` | Institute lecture request form |

### Auth routes

| Route | Purpose |
|-------|---------|
| `/login` | Credentials sign-in |
| `/register` | Create account |
| `/reset-password` | Request password reset link |
| `/set-password` | Set new password using reset token |
| `/auth/signin` | Redirect to `/login` |

### Account routes

| Route | Purpose |
|-------|---------|
| `/account` | Profile form, password form, registered competitions |
| `/account/orders` | Playbook/mentorship orders |
| `/account/mentorship` | Mentorship bookings with payment action |
| `/account/requests` | Bookings, speaker applications, lecture requests |

### Admin routes

| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard grid |
| `/admin/competitions` | List competitions |
| `/admin/competitions/new` | Create competition |
| `/admin/competitions/[id]/edit` | Edit competition |
| `/admin/competitions/[id]/progress` | Advance teams between rounds |
| `/admin/competitions/[id]/results` | Assign winner ranks |
| `/admin/mentorship` | Manage mentorship bookings |
| `/admin/speaker-applications` | Approve/reject speakers |
| `/admin/lecture-requests` | Manage lecture requests |
| `/admin/orders` | View all orders |
| `/admin/playbooks` | Placeholder for playbook management |

## Core libraries (`web/lib/`)

| File | Purpose |
|------|---------|
| `prisma.ts` | Singleton PrismaClient |
| `auth.ts` | Re-exports bcrypt `compare`/`hash` |
| `authOptions.ts` | NextAuth credentials provider, JWT/session callbacks |
| `competition.ts` | Status helpers, date formatting, round parsing |
| `razorpay.ts` | Razorpay instance + test-mode detection |
| `storage.ts` | S3/R2 client with local fallback |
| `certificate.ts` | Canvas-based certificate PNG generator |

## Authentication

NextAuth.js v4 credentials provider:

- User submits email + password.
- Server looks up user by email, compares bcrypt hash.
- JWT stores `id`, `email`, `name`, `college`, `isAdmin`.
- Session duration: 30 days.
- Admin emails are hardcoded in `/api/auth/register`.

## Payments

Razorpay integration:

- `/api/orders/create` creates a Razorpay order for playbook or mentorship.
- `/api/orders/verify` verifies Razorpay signature and marks order `paid`.
- `RazorpayButton.tsx` loads Razorpay checkout script and handles the flow client-side.
- Test-mode signature bypass exists for local development.

## File storage

`lib/storage.ts` chooses between local disk and S3-compatible storage:

- If `S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` are set (plus `R2_ENDPOINT` or `AWS_REGION`), it uses S3/R2.
- Otherwise it writes to `process.cwd()` under the given key path and serves via `/api/uploads/[...path]`.

Used for:
- Competition submissions
- Competition logos/banners
- Certificate generation

## PWA

- `public/manifest.json`: name, short_name, icons, theme color `#2E6BFF`, standalone display.
- `next-pwa` generates service worker into `public/`.
- `public/offline.html`: offline fallback page.
- `PwaInstallPrompt.tsx`: browser install banner.
- Icons generated by `npm run generate-pwa-icons`.

## Verification scripts

Located in `web/scripts/`:

| Script | Purpose |
|--------|---------|
| `verify-phase-0.ts` | Foundation checks (DB counts, seed users, admin) |
| `verify-phase-1.ts` | Design system + static pages |
| `verify-phase-2.ts` | Auth + account |
| `verify-phase-3.ts` | Competitions backend |
| `verify-phase-4.ts` | Playbooks backend |
| `verify-phase-5.ts` | Mentorship + guest lectures |
| `verify-phase-6.ts` | PWA + deploy |
| `verify-all.ts` | End-to-end integration test (40 checks) |
| `security-checks.ts` | Admin route guards, dev-only endpoints |
| `generate-pwa-icons.ts` | Generate PNG icons from SVG |
| `migrate-supabase.ts` | Legacy Supabase migration |

Run with:

```bash
cd web
npm run verify:all
npm run verify:security
```
