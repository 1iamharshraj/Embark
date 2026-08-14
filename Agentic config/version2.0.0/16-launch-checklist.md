# Embark 2.0.0 — Launch Checklist

> Operational checklist for taking the 2.0.0 app from verified local/staging state to production.

## 1. Pre-launch code verification

- [x] `npm run build` passes locally.
- [x] `npx tsc --noEmit` passes.
- [x] `npx prisma validate` passes.
- [ ] `npm audit` has no high/critical vulnerabilities unresolved. *(see note below)*
- [x] Jest unit tests pass; Playwright E2E smoke tests configured.
- [ ] All Playwright and Jest tests pass in CI.
- [ ] No `console.log` statements in production API routes.
- [x] Environment variables documented in `.env.example`.

> **Security note:** `npm audit` reports two high-severity advisories tied to Next.js 14.2.35 / bundled PostCSS. The only official fix is upgrading to Next.js 16, which is a breaking change. Resolvable transitive vulnerabilities (`serialize-javascript`, `glob`) have been pinned to safe versions via `overrides` in `package.json`. The Next.js/PostCSS upgrade is tracked as a post-launch dependency sweep.

## 2. Production database

- [ ] Neon/RDS PostgreSQL provisioned.
- [ ] `DATABASE_URL` set in Vercel.
- [ ] `prisma migrate deploy` run against production.
- [ ] Database backup schedule configured.
- [ ] Migration scripts for existing data tested on staging.

## 3. Redis and queues

- [ ] Redis/upstash provisioned.
- [ ] `REDIS_URL` set in Vercel.
- [ ] BullMQ workers tested in staging.
- [ ] Queue retry and dead-letter strategy documented.

## 4. Object storage

- [ ] S3/R2 bucket created.
- [ ] Public/private folders configured.
- [ ] Bucket CORS policy allows Vercel domains.
- [ ] Lifecycle/cleanup policy configured.
- [ ] Presigned upload/download tested end-to-end.

## 5. Payments

- [ ] Razorpay live keys generated.
- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` set in Vercel.
- [ ] Webhook endpoint configured in Razorpay dashboard.
- [ ] Signature verification tested with live signature.
- [ ] A real ₹1 test order placed and refunded.
- [ ] Commission rules configured in platform settings.

## 6. Email

- [ ] Resend production API key set.
- [ ] `EMAIL_FROM` domain verified (SPF/DKIM).
- [ ] Welcome, booking, payment, and verification templates tested.
- [ ] Email queue worker running.

## 7. Authentication and OAuth

- [ ] `NEXTAUTH_SECRET` is strong random string ≥ 32 chars.
- [ ] `NEXTAUTH_URL` points to production domain.
- [ ] Google OAuth app configured with production domain.
- [ ] Refresh token rotation tested.

## 8. DNS and domain

- [ ] Domain added to Vercel project.
- [ ] DNS records point to Vercel.
- [ ] HTTPS auto-renewal enabled.
- [ ] Old Hostinger redirects configured if needed.

## 9. PWA

- [x] `manifest.json` updated for 2.0.0.
- [x] Icons generated (192, 512, maskable).
- [x] Offline fallback page works.
- [ ] Service worker registers on mobile Chrome.
- [ ] Install prompt tested on Android.

## 10. Redirects and SEO

- [x] `next.config.js` redirects old URLs:
  - `/competitions` → `/hackathons`
  - `/competition/[id]` → `/hackathon/[id-or-slug]`
  - `/mentor/[slug]` → `/experts`
- [ ] `robots.txt` and sitemap generated.
- [ ] Page titles and meta descriptions set on new pages.

## 11. Data migration

- [ ] Production database backed up.
- [x] User, Competition→Hackathon, Registration, Submission, Winner, and Order migration scripts created in `web/scripts/migrate-v2-data.ts`.
- [ ] Migration scripts run and validated on production.
- [ ] Files copied to new bucket structure.
- [ ] Spot-check migrated records.

## 12. Monitoring and error tracking

- [ ] Sentry DSN set.
- [ ] Vercel Analytics enabled.
- [ ] PostHog key set (if using).
- [ ] Structured logging configured.
- [ ] Admin alert channel for payment/queue failures.

## 13. Security

- [ ] RBAC enforced on all admin/API routes.
- [ ] File upload validation tested.
- [ ] Rate limiting active on auth and payment endpoints.
- [ ] CORS configured.
- [ ] Secure cookies in production.
- [ ] Secrets not committed or logged.

## 14. Performance and accessibility

- [ ] Lighthouse scores ≥ 90 on critical pages.
- [ ] Images optimized with Next.js `<Image>`.
- [ ] Reduced-motion preference honored.
- [ ] Keyboard navigation works for nav, forms, modals, tables.

## 15. Soft launch

- [ ] Deploy to production domain.
- [ ] Soft launch to trusted users.
- [ ] Monitor Sentry and Vercel logs for 48 hours.
- [ ] Verify critical flows: auth, booking, payment, hackathon, certificate.

## 16. Hard launch

- [ ] Public announcement prepared.
- [ ] Support channel ready.
- [ ] Rollback plan documented and tested.
- [ ] Launch publicly.

## 17. Post-launch

- [ ] Monitor for one week.
- [ ] Address P0/P1 issues immediately.
- [ ] Schedule post-launch dependency upgrade sweep.
- [ ] Archive or update any remaining legacy documentation.
