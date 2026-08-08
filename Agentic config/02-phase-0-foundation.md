# Phase 0 — Foundation

> Build the skeleton of the new application so the rest of the work has a stable base.

## Goal

Create a runnable Next.js 14 + TypeScript project, connect it to a local PostgreSQL database via Docker, set up Prisma migrations, set up NextAuth with email/password, port the design tokens, and seed the database with enough data to test every flow.

## Output

A `web/` directory that you can run with `docker compose up` and then `npm run dev`. You can sign in as a test admin and a test student, and the database contains competitions, playbooks, mentors, and sample requests.

## Steps

1. **Create the Next.js app**
   - `npx create-next-app@14 web --typescript --tailwind --eslint --app --no-src-dir`
   - Install additional packages:
     - `prisma` + `@prisma/client`
     - `next-auth` (Auth.js v5 beta)
     - `bcryptjs` + `@types/bcryptjs`
     - `react-hook-form` + `zod` + `@hookform/resolvers`
     - `date-fns`
     - `sonner`
     - `next-pwa` (or `@serwist/next`)
     - ` formidable` or `@aws-sdk/client-s3` + `uuid` (for file uploads; start with local filesystem for dev)
   - Keep the old static site at the repo root untouched during this phase.

2. **Docker Compose setup**
   - Create `web/docker-compose.yml` with three services:
     - `postgres`: PostgreSQL 15, port `5432`, volume `pgdata`.
     - `minio` (optional): S3-compatible storage, port `9000` and console `9001`.
     - `app`: depends on postgres, runs `npm run dev`.
   - Add a `.env` file for local dev and `.env.example` for the repo.

3. **Tailwind config + design tokens**
   - In `web/tailwind.config.ts`, extend the theme with the existing Embark India palette:
     - `orange: '#2E6BFF'` (accent)
     - `orangeDeep: '#1D4ED8'`
     - `orangeSoft: '#E5EDFF'`
     - `cream: '#F4F7FC'`
     - `charcoal: '#161616'`
     - `inkSoft: '#6B7280'`
     - `navy: '#0B1F3A'`
     - `navyDeep: '#08172B'`
     - `green: '#0B1F3A'` (kept for compatibility, but visually navy)
   - Load Bricolage Grotesque and Inter via `next/font/google` or a `<link>` in the root layout.

4. **Prisma schema and first migration**
   - Copy the schema from `Agentic config/11-data-model-seed.md` into `web/prisma/schema.prisma`.
   - Run `npx prisma migrate dev --name init`.
   - Create `web/lib/prisma.ts` that exports a singleton Prisma client.

5. **NextAuth setup**
   - Configure `web/app/api/auth/[...nextauth]/route.ts` (or the Auth.js v5 `auth.ts` + `route.ts` pattern).
   - Use Credentials provider with `bcrypt.compare`.
   - In the JWT/session callbacks, include `id`, `email`, `name`, `college`, `isAdmin`.
   - Add a `middleware.ts` that protects `/admin/*` and `/account/*`.

6. **Shared components**
   - Build the atomic pieces in `web/components/`:
     - `TopBar.tsx` — email, phone, consultation CTA, social icons.
     - `Nav.tsx` — wordmark, nav links, mobile burger, CTA buttons.
     - `Footer.tsx` — footer with animated path, links, socials.
     - `Button.tsx` — primary, ghost, green, light variants.
     - `Eyebrow.tsx`, `Section.tsx`, `Container.tsx`.
   - Create the root layout at `web/app/layout.tsx` with these components, plus Sonner toaster.

7. **Seed script**
   - Create `web/prisma/seed.ts`.
   - Seed:
     - 1 admin user (founder email) and 2 test students with known passwords.
     - 6 stream playbooks + 15 shop playbooks from the current data.
     - 10 mentors.
     - 5 competitions from the current Supabase seed (shifted dates so some are live/upcoming/closed).
     - A few registrations, submissions, advancements, and winners so the admin panel is not empty.
     - 2 speaker applications and 2 lecture requests.
   - Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to `package.json`.
   - Run `npx prisma db seed` and verify counts in the database.

8. **Verification checklist**
   - [ ] `docker compose up` starts Postgres without errors.
   - [ ] `npm run dev` starts the Next.js app on `http://localhost:3000`.
   - [ ] You can sign in with the seeded admin email and a seeded student email.
   - [ ] The admin user has `isAdmin = true`; the student does not.
   - [ ] The database contains at least one live competition, one upcoming competition, one closed competition.
   - [ ] The homepage skeleton (nav + footer + a placeholder heading) renders.

## Risks / notes

- Auth.js v5 is still in beta. If it becomes unstable, fall back to NextAuth v4 with the same Credentials provider.
- Keep passwords short and memorable for the seed users; document them in `.env.example` or a local note only.
- Do **not** commit real `.env` values. The repo should only contain `.env.example`.
