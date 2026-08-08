# 13 — Launch Checklist

Checklist for taking the `web/` Next.js 14 rebuild from verified local state to production.

## 1. Vercel project setup

- [ ] Create a new Vercel project (or reuse existing) and import the `NarentherMS/EmbarkIndia` repo.
- [ ] Set the **Root Directory** to `web/`.
- [ ] Use the default Next.js build settings (`next build` output).
- [ ] Disable Vercel-generated domains for public traffic until DNS is ready (or keep them for preview testing).

## 2. Production database (Neon)

- [ ] Create a Neon PostgreSQL project.
- [ ] Copy the connection string to `DATABASE_URL` in Vercel environment variables.
- [ ] Run `npx prisma migrate deploy` against the Neon database (do not use `migrate dev` on production data).
- [ ] Optional: run `npx prisma db seed` to seed initial competitions, mentors, playbooks, and the admin user.
- [ ] Verify the admin user `ajay.san36@gmail.com` exists and has `isAdmin = true`.

## 3. Environment secrets

In the Vercel project settings, set:

- [ ] `DATABASE_URL` — Neon connection string.
- [ ] `NEXTAUTH_SECRET` — strong random secret (≥ 32 chars).
- [ ] `NEXTAUTH_URL` — `https://embarkindia.in` (or the production domain).
- [ ] `RAZORPAY_KEY_ID` — production Razorpay key (`rzp_live_...`).
- [ ] `RAZORPAY_KEY_SECRET` — production Razorpay secret.
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same public key, if the frontend needs it.
- [ ] R2 / S3 credentials (if replacing local uploads):
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (or equivalent S3 env vars).
- [ ] Email provider credentials for password reset (e.g., SendGrid, AWS SES, Postmark).
- [ ] Any optional analytics/logging keys.

## 4. Payments

- [ ] Switch Razorpay from test keys to production live keys.
- [ ] Verify the payment signature check in `app/api/orders/verify/route.ts` works with live signatures.
- [ ] Do a real ₹1 test order (and refund it) to confirm the end-to-end flow.

## 5. File storage

- [ ] Replace `app/api/uploads/[...path]/route.ts` local storage with R2/S3 presigned uploads if submissions/certificates need cloud storage.
- [ ] Update certificate generation and submission download URLs to point to the public storage URL.
- [ ] Set a lifecycle/cleanup policy on the bucket.

## 6. Email

- [ ] Replace the console-log reset link in `app/api/auth/reset-password/route.ts` with an email send call.
- [ ] Test password reset end-to-end with a real mailbox.
- [ ] Ensure the reset link uses the production domain (`https://embarkindia.in/set-password?token=...&email=...`).

## 7. Data migration from old Supabase

- [ ] If old Supabase data needs to be preserved, run `npm run migrate:supabase` (or the equivalent migration script) after configuring the old Supabase credentials.
- [ ] Spot-check migrated users, competitions, registrations, submissions, and orders.
- [ ] Re-hash or reset passwords for migrated users because Supabase and NextAuth hashes are incompatible; use a forced password-reset flow.

## 8. Production build and end-to-end tests

- [ ] Trigger a Vercel production deployment.
- [ ] Run `npx tsc --noEmit` and `npm run build` locally one final time.
- [ ] Run the verification suite against the production domain (set `BASE_URL=https://embarkindia.in` and `SKIP_SERVER_START=1`):
  - `npm run verify:all`
  - `npm run verify:security`
- [ ] Test admin login, competition registration, playbook purchase, mentorship booking, and guest-lecture flows on the production domain.

## 9. Lighthouse and PWA

- [ ] Run Lighthouse in Chrome for `/`, `/competitions`, `/playbooks`, `/mentorship`.
- [ ] Fix any critical performance/accessibility issues (target: 90+ on all categories).
- [ ] Verify the PWA install prompt works on mobile Chrome.
- [ ] Verify `/manifest.json`, `/sw.js`, and icons load correctly.

## 10. DNS cutover

- [ ] In Hostinger DNS, point the A record for `embarkindia.in` to Vercel’s load balancer IPs.
- [ ] Add the domain in Vercel project settings and verify it.
- [ ] Enable HTTPS / auto-renewal in Vercel.
- [ ] Wait for DNS propagation and confirm `https://embarkindia.in` loads the new Next.js app.
- [ ] Keep the old static site files at the repo root until this cutover is verified.

## 11. Post-cutover cleanup

- [ ] Once production traffic is verified on Vercel for 24–48 hours, move the old static HTML files from the repo root to `archive/`.
- [ ] Update `README.md` to remove references to the legacy static site.
- [ ] Archive the old Supabase project after a final backup if it is no longer needed.

## 12. Post-launch backlog

- [ ] Schedule a dependency upgrade sweep (Next.js 14 → 15/16, next-pwa, eslint-config-next) to clear `npm audit` high-severity findings.
- [ ] Implement push notifications for PWA.
- [ ] Set up production monitoring (Vercel Analytics, Sentry, or Logrocket).
- [ ] Configure automated backups for the Neon database.
- [ ] Set up a staging environment for future releases.

## 13. Announce launch

- [ ] Prepare launch announcement for LinkedIn, email list, and campus channels.
- [ ] Verify competitions, mentorship, and playbook flows one last time after DNS cutover.
- [ ] Mark launch complete.
