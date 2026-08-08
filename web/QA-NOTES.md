# Phase 7 QA Notes — Embark India Next.js 14 Rebuild

This document captures the final QA verification results for the `web/` Next.js 14 rebuild.

## What was tested

Phase 7 exercised every major user flow end-to-end with `npm run verify:all`:

| Area | Checks |
|------|--------|
| Phase 0 sanity | DB counts for all tables; live / upcoming / closed / draft competitions; seed admin & student users. |
| Auth | Registration, duplicate blocking, login, session fields, profile update, change password, password reset token flow, set-password with token. |
| Competitions | Register for live comp, duplicate/closed registration blocked, round 0 submission, admin advancement, round 1 submission, mark winner, winner certificate PNG download. |
| Playbooks | Access denied before purchase, Razorpay test-mode order, payment verification, access granted, progress save/fetch, `/account/orders` page. |
| Mentorship | Submit booking for `kavitha-venkat`, admin confirm, create mentorship order, test-mode payment, booking status `paid`, `/account/mentorship` page. |
| Guest lectures | Speaker application and lecture request submission; admin lists and status updates (verified / shortlisted); `/account/requests` page. |
| Admin guards | `/account` redirects to `/login` when unauthenticated; `/admin` redirects to `/account` for non-admin; admin APIs reject unauthenticated (401/403) and non-admin (403). |
| PWA / redirects | `manifest.json`, `/sitemap.xml` XML, `/robots.txt`, old `.html` URLs redirect to new routes. |
| Dev route guard | `app/api/dev/reset-tokens/route.ts` returns 404 unless `NODE_ENV === "development"`. |

Security checks were run with `npm run verify:security`. All admin API endpoints tested return 401/403 for unauthenticated requests and 403 for non-admin sessions.

## Results

- `npx tsc --noEmit`: **passed**
- `npm run build`: **passed** (49 static/dynamic routes, PWA service worker generated)
- `npm run verify`: **passed**
- `npm run verify:phase1`: **passed**
- `npm run verify:phase2`: **passed**
- `npm run verify:phase3`: **passed**
- `npm run verify:phase4`: **passed**
- `npm run verify:phase5`: **passed**
- `npm run verify:phase6`: **passed** (build check only; HTTP checks skipped because no dev server was running)
- `npm run verify:all`: **passed** — 40/40 checks
- `npm run verify:security`: **passed** — 11/11 checks

## npm audit results

`npm audit` reports **10 high-severity vulnerabilities**. None are in application code; all are in build-time or framework dependencies:

| Package | Severity | Notes | Recommendation |
|---------|----------|-------|----------------|
| `glob` (via `@next/eslint-plugin-next` → `eslint-config-next`) | high | Command injection in `glob` CLI. Only triggered by ESLint tooling, not runtime. | Keep in dev-only tooling. Revisit after Next.js 14 → 15/16 migration. |
| `next` 14.2.35 | high | Multiple DoS / cache poisoning / SSRF advisories affecting self-hosted or advanced configurations. | Plan upgrade to Next.js 15/16 after launch. Monitor Vercel security patches for the 14.x line. |
| `postcss` (bundled with Next.js) | high | XSS / arbitrary file read via source maps. Build-time only. | Will be updated with Next.js upgrade. |
| `serialize-javascript` (via `next-pwa` → workbox) | high | RCE via serialized RegExp/Date. Build-time / service-worker generation only. | Update `next-pwa` or migrate to `@serwist/next` after launch. |

**Action:** No fixes applied before launch because all fixes require major-version upgrades (Next.js 14 → 16, next-pwa → serwist) that are out of scope for Phase 7. Schedule a P1 post-launch dependency sweep.

## Known limitations and P2 backlog

1. **Payments:** Razorpay is configured in test mode (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are placeholders). Production keys and live verification must be enabled before accepting real payments.
2. **File storage:** `app/api/uploads/[...path]` stores files locally. Production needs S3/R2 (or Supabase Storage) with presigned URLs and a cleanup policy.
3. **Email:** Password reset prints the reset link to the console. A real email provider (SendGrid, AWS SES, Postmark, etc.) must be wired into `/api/auth/reset-password` for production.
4. **Push notifications:** Not implemented. PWA service worker is registered but has no push handler.
5. **Database hosting:** Local PostgreSQL via Docker. Production should move to Neon / RDS with `npx prisma migrate deploy`.
6. **Hosting / DNS:** Deployment to Vercel and DNS cutover from Hostinger are pending.
7. **Old static site:** The legacy static HTML files remain at the repo root (`index.html`, `competitions.html`, etc.). They should be moved to `archive/` **only after** production DNS is switched to Vercel and verified.

## Old static site

The previous static site (HTML/CSS/JS at the repository root) is intentionally left untouched. It serves as the live archive until the Vercel deployment is live and DNS is cut over. Do not delete or move those files until the new app is verified on the production domain.

---

Generated: 2026-08-08 during Phase 7 final QA.
