# Phase 9 — Deploy & Migration

> Prepare production infrastructure, migrate existing data to the 2.0.0 schema, polish the PWA, and set up CI/CD.

## Goal

The app is deployable to production with all 2.0.0 data migrated, old URLs redirected, PWA assets updated, and environment secrets configured. Existing users, competitions/hackathons, orders, and playbook data are preserved.

## Output

- Production PostgreSQL (Neon/RDS) and Redis (ElastiCache/upstash) provisioned.
- S3/R2 bucket configured for file storage.
- Razorpay live keys ready (still test until launch approval).
- Resend configured for email.
- PWA manifest and icons updated.
- Data migration scripts run against production-like environment.
- Redirects from old routes (`/competition/[id]`, `/competitions`, `/mentor/[slug]`, `/playbook/[slug]`) maintained.
- GitHub Actions CI/CD pipeline.
- Vercel project configured and deployed.

## Steps

1. **Production infrastructure**
   - Provision Neon/RDS PostgreSQL and copy connection string.
   - Provision Redis (upstash/ElastiCache) and copy URL.
   - Create S3/R2 bucket with public/private folders and lifecycle policy.
   - Set CloudFront/R2 public URL for public assets.
   - Configure DNS and Vercel project.

2. **Environment secrets**
   - Set all required env vars in Vercel and `.env.example`:
     - `DATABASE_URL`, `REDIS_URL`
     - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
     - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
     - `RESEND_API_KEY`, `EMAIL_FROM`
     - `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL`
     - `SENTRY_DSN`, `POSTHOG_KEY` (optional)

3. **PWA polish**
   - Update `public/manifest.json` with 2.0.0 branding.
   - Generate icon sizes 192x192, 512x512, maskable.
   - Update offline fallback page.
   - Configure service worker caching.
   - Verify install prompt on mobile Chrome.

4. **Data migration scripts**
   - Script to migrate existing `User` → new schema with roles.
   - Script to migrate `Competition` → `Hackathon` + timelines.
   - Script to migrate `Registration` → `HackathonRegistration`.
   - Script to migrate `Submission` → `HackathonSubmission` + files.
   - Script to migrate `Winner` → `HackathonResult`.
   - Script to migrate existing `Order` → generic `Order` with `type`.
   - Script to copy local/S3 files to new bucket structure.
   - Run scripts against staging first, then production.

5. **URL redirects**
   - Keep `next.config.js` redirects:
     - `/competitions` → `/hackathons`
     - `/competition.html` → `/hackathons`
     - `/competition/[id]` → `/hackathon/[id-or-slug]`
     - `/mentor/[slug]` → `/expert/[id-or-slug]`
     - `/playbooks` → `/playbooks` (unchanged)
   - Add new redirects if route names change.

6. **CI/CD pipeline**
   - GitHub Actions workflow:
     - lint
     - type check (`tsc --noEmit`)
     - build
     - run Prisma validate
     - security checks (`npm audit`)
     - deploy to Vercel preview on PR
     - deploy to production on merge to `main` (manual approval optional)

7. **Staging deployment**
   - Deploy branch to Vercel preview/staging.
   - Run smoke tests against staging URL.
   - Run data migration scripts against staging database.
   - Verify all critical flows: auth, booking, payment, hackathon, certificate.

8. **Production deployment**
   - Apply migrations to production database with `prisma migrate deploy`.
   - Run data migration scripts.
   - Verify Razorpay test transactions in production-like environment.
   - Keep old site in `prototype/` as backup.

9. **Verification checklist**
   - [ ] Production database and Redis are reachable from Vercel.
   - [ ] S3/R2 presigned uploads and downloads work.
   - [ ] Razorpay test checkout works on production domain.
   - [ ] Resend test email sends successfully.
   - [ ] `prisma migrate deploy` runs without errors on production.
   - [ ] Existing users can log in after migration.
   - [ ] Existing competitions appear as hackathons.
   - [ ] Old `/competition/[id]` URLs redirect correctly.
   - [ ] PWA installs and offline page works.
   - [ ] CI/CD pipeline passes on PR and deploys to preview.
   - [ ] Staging smoke tests pass.

## Risks / notes

- Back up production database before running migration scripts.
- Razorpay live keys require KYC; do not switch to live until QA approves.
- Redis on Vercel serverless may require upstash or similar managed Redis.
- Long-running migration scripts should run outside Vercel build (via CLI or GH Actions).
- Keep the `prototype/` folder intact until launch cutover is verified.
