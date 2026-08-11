# Target architecture

## 1. Application stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14 App Router** | Full-stack React, SSR/SSG, API routes, PWA support, easy deploy. |
| Language | **TypeScript** | Catches errors early; required for Prisma and NextAuth. |
| Styling | **Tailwind CSS** | Utility-first, easy to port the existing design tokens, small bundle. |
| ORM | **Prisma** | Clean schema, migrations, type-safe queries, good DX. |
| Database | **PostgreSQL** | Local via Docker; production via **Neon**. |
| Auth | **NextAuth.js v5 (Auth.js)** | Credentials provider with email + bcrypt password. Admin role in DB. |
| Forms | **React Hook Form + Zod** | Validation and type-safe forms. |
| Dates | **date-fns** | Lightweight, reliable date math for competition windows. |
| Notifications | **Sonner** or **React Hot Toast** | Toast messages for form feedback. |
| Payments | **Razorpay** | Indian payment gateway; supports UPI, cards, netbanking. |
| File storage (dev) | **Local filesystem volume** | Mounted into Docker; simple and fast for local testing. |
| File storage (prod) | **AWS S3 / Cloudflare R2 / Backblaze B2** | Cheap, scalable object storage. |
| PWA | **next-pwa** or custom service worker + manifest | Installable app, offline caching, icons, theme colour. |
| Deploy (prod) | **Vercel** (or Render/Railway) | Natural fit for Next.js; serverless functions replace API routes. |

## 2. Project structure (suggested)

```
EmbarkIndia/
  web/                          ← new Next.js app
    app/                        ← App Router routes
      (marketing)/              ← public-facing marketing pages
        page.tsx                ← homepage with chosen hero
        mentorship/
        guest-lectures/
        playbooks/
        ...
      (auth)/                   ← login, register, reset
      api/                      ← API routes
        auth/[...nextauth]/
        competitions/
        registrations/
        submissions/
        playbooks/
        orders/
        ...
    components/                 ← shared UI components
    lib/                        ← prisma client, auth config, helpers
    prisma/
      schema.prisma
      migrations/
      seed.ts
    public/                     ← PWA manifest, icons, static assets
    uploads/                    ← local dev uploads (gitignored)
    docker-compose.yml
    .env.example
  Agentic config/               ← this plan
  design-source/                ← Word docs (gitignored)
```

The old static site is archived in `prototype/` and served by the `static` Docker Compose service until the new app replaces it.

## 3. Development environment

A `docker-compose.yml` should run:

- `next` service: the Next.js dev server.
- `postgres` service: PostgreSQL 15+ with a persistent volume.
- `minio` service (optional): S3-compatible storage for production-like file uploads.

`.env` variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/embarkindia?schema=public"
NEXTAUTH_SECRET="local-secret-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="embarkindia"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
```

## 4. Production environment

- **Neon** serverless Postgres: create a project, copy the connection string, set `DATABASE_URL`.
- **R2/B2/S3 bucket** for files; set the bucket credentials.
- **Vercel**: connect the `web/` directory, set environment variables, deploy.
- **Razorpay**: switch from test keys to live keys after testing.

## 5. Auth flow

- NextAuth Credentials provider checks email + bcrypt password.
- On sign-up, create a user in `User` table with `isAdmin` set to `false` unless the email matches the founder/admin list.
- Password reset: generate a short-lived token, email a link (use Resend/NodeMailer in production), allow setting a new password.
- Admin access: protected by middleware checking `session.user.isAdmin`.

## 6. File uploads

- Competition submissions: stored under `submissions/{userId}/{competitionId}/round{roundIdx}/{timestamp}-{filename}`.
- Competition logos/banners: stored under `public-assets/{competitionId}/...`.
- Local dev: serve uploaded files via a static API route or Next.js `public/` sync.
- Production: upload to S3 and return a signed URL for download.

## 7. PWA checklist

- `manifest.json` with name, short_name, icons, theme colour, background colour, start_url, display mode.
- Service worker caching static assets and pages via `next-pwa` or `Serwist`.
- Offline fallback page.
- Apple touch icon and maskable icon.
- `theme-color` meta tag.
