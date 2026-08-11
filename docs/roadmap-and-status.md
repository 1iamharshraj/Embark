# Roadmap & Status

This document tracks the current state, phase plan, launch checklist, and open backlog.

## Current status (as of 2026-08-08)

The Next.js app in `web/` is **feature-complete locally** and passes all verification scripts.

| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ |
| `npm run verify` through `verify:phase6` | ✅ |
| `npm run verify:all` (40/40 checks) | ✅ |
| `npm run verify:security` (11/11 checks) | ✅ |

### Built features (Next.js)

- Real email/password auth with bcrypt.
- Account dashboard with profile, password, orders, mentorship, requests.
- Case competitions: create, publish, register, submit, advance teams, winners, certificates.
- Admin console for competitions, mentorship, speakers, lecture requests, orders.
- Playbooks: stream guides + shop, Razorpay checkout, access gating, progress saving.
- Mentorship: mentor directory, profile, booking requests, payment.
- Guest lectures: speaker applications and institute lecture requests.
- PWA: manifest, service worker, offline page, install prompt.
- Legacy `.html` redirects in `next.config.mjs`.

### Known blockers before public launch

1. **Payments:** Razorpay is in test mode. Replace with production keys.
2. **Email:** Password-reset links are logged to console. Integrate a real email provider.
3. **File storage:** Local uploads. Move to S3/R2/Supabase Storage for production.
4. **Database hosting:** Local Docker Postgres. Move to Neon.
5. **Hosting / DNS:** Deploy to Vercel and cut over DNS from Hostinger.
6. **Old static site:** Keep at repo root until production DNS switch is verified; then move to `archive/`.
7. **Dependencies:** `npm audit` reports 10 high-severity issues in build-time/framework packages. Schedule a post-launch upgrade sweep.

## Phase plan

The rebuild was split into 8 ordered phases, each with a verifiable deliverable.

| Phase | Goal | Deliverable | Status |
|-------|------|-------------|--------|
| **0. Foundation** | Next.js + Docker + Prisma + NextAuth + Tailwind + design tokens | Runnable `web/` app with seeded data | ✅ |
| **1. Design system + static pages** | Port shared components and all marketing pages | All public routes render; homepage uses chosen hero | ✅ |
| **2. Auth + account** | Real auth and account dashboard | Login, register, reset password, account, admin guards | ✅ |
| **3. Competitions backend** | Full Postgres competition engine | CRUD, register, submit, advance, winners, certificates, admin console | ✅ |
| **4. Playbooks backend** | DB playbooks + real checkout | Playbooks from DB, Razorpay orders, access gating, progress, admin orders | ✅ |
| **5. Mentorship + guest lectures backend** | Persist bookings and requests | Mentor bookings, speaker applications, lecture requests, admin management | ✅ |
| **6. PWA + deploy** | Installable app, prod infra, redirects | PWA assets, Neon + R2 + Vercel, old URL redirects | 🟡 In planning |
| **7. QA + launch** | End-to-end testing and public launch | Production verified, Lighthouse green, launch announced | 🟡 In planning |

## Hero section choice

The Next.js homepage uses **Slide 1** from the old homepage carousel:

- **Eyebrow:** The platform
- **H1:** Your MBA journey needs more than advice. It needs a roadmap.
- **Sub:** Embark India helps tier-2 MBA students move from confusion to clarity — from college selection to case competitions, internships, and final placements.
- **CTAs:** Start your MBA journey · Explore services

**Rationale:** Broadest platform promise, fits the roadmap metaphor, and does not over-promise any single unfinished feature.

## Launch checklist

### Infrastructure

- [ ] Set up Vercel project from `NarentherMS/EmbarkIndia` with root directory `web/`.
- [ ] Create Neon Postgres project and set `DATABASE_URL`.
- [ ] Run `prisma migrate deploy` on production database.
- [ ] Ensure founder email `ajay.san36@gmail.com` has `isAdmin = true`.
- [ ] Configure Cloudflare R2 (or AWS S3) bucket and credentials.
- [ ] Set all environment variables in Vercel.

### Payments

- [ ] Switch Razorpay to live keys.
- [ ] Verify signature check logic works in production.
- [ ] Perform a ₹1 real transaction and refund.

### Email

- [ ] Integrate Resend / NodeMailer / AWS SES.
- [ ] Set `EMAIL_SERVER` and `EMAIL_FROM`.
- [ ] Test end-to-end password reset on production domain.

### Data migration

- [ ] Run Supabase migration script.
- [ ] Spot-check users, competitions, registrations, submissions, orders.
- [ ] Force password reset for all migrated users.

### Production verification

- [ ] Deploy to Vercel.
- [ ] Run `tsc` and `build` against production env.
- [ ] Run `verify:all` and `verify:security` against production.
- [ ] Test public flows: register, login, competition registration, submission, playbook purchase, mentor booking.
- [ ] Test admin flows: create competition, advance teams, mark winners, manage orders/requests.

### SEO / redirects / PWA

- [ ] Confirm legacy `.html` redirects work.
- [ ] Verify sitemap.
- [ ] Run Lighthouse on `/`, `/competitions`, `/playbooks`, `/mentorship` (target 90+).
- [ ] Verify PWA install prompt, manifest, service worker, icons, offline page.

### DNS cutover

- [ ] Add custom domain in Vercel.
- [ ] Update Hostinger DNS A record to Vercel.
- [ ] Enable HTTPS.
- [ ] Verify `https://embarkindia.in` loads the Next.js app.
- [ ] Keep old static files until verified.

### Post-cutover

- [ ] Move old HTML files to `archive/`.
- [ ] Update root `README.md`.
- [ ] Archive or downgrade old Supabase project.
- [ ] Schedule dependency upgrade sweep.
- [ ] Set up monitoring (Sentry, LogRocket, Vercel Analytics).
- [ ] Announce launch on LinkedIn, email list, campus channels.

## Open backlog

### Revenue-critical

- [ ] Switch Razorpay to live mode.
- [ ] Define playbook fulfilment: download link, gated page, or email.
- [ ] Define mentorship payment and scheduling flow after payment.

### Content / polish

- [ ] Confirm real card stats for placeholdered playbooks (Sales, Statistics, Analytics, Economics, Supply Chain, Market Research, Strategy, Product Management, Project Management).
- [ ] Confirm playbook prices (currently ₹499 except Guesstimates ₹399).
- [ ] Confirm playbook cover colors (currently blue-toned).
- [ ] Build or drop blog references.

### Future services

- [ ] Jobs & internships community.
- [ ] Courses.
- [ ] Mock interviews & GDs.

### Technical debt

- [ ] Upgrade Next.js and dependencies to resolve `npm audit` issues.
- [ ] Add push notifications.
- [ ] Set up staging environment.
- [ ] Automate database backups on Neon.
