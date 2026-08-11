# Embark 2.0.0 — Current State

> Baseline of the existing `web/` application before starting version 2.0.0.

## 1. What Embark is

A career-development platform for Tier-2 MBA students in India. It connects students with mentors, alumni, industry professionals, and practical challenges (hackathons/case competitions).

Current brand voice: sharp, confident, mentor-like. Tagline theme: *“start before you feel ready.”*

## 2. Current implementation

The active rebuild is in `web/`:

- **Framework:** Next.js 14 App Router.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS with custom design tokens.
- **Database:** PostgreSQL via Prisma ORM.
- **Auth:** NextAuth.js v4 with credentials provider and JWT session.
- **Payments:** Razorpay test mode.
- **File storage:** Local upload handler; production target S3/R2.
- **PWA:** `next-pwa`, manifest, service worker, offline page.
- **Admin:** Protected `/admin/*` routes and `/api/admin/*` API namespace.

The legacy static site has been archived in `prototype/`.

## 3. Existing pages and status

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Marketing homepage. |
| `/competitions` | ✅ | Competition list. |
| `/competition/[id]` | ✅ | Detail, registration, submission. |
| `/admin/competitions` | ✅ | Competition management. |
| `/playbooks` | ✅ | Playbook shelf + shop grid. |
| `/playbook/[slug]` | ✅ | Detail + progress checklist. |
| `/mentorship` | ✅ | Mentor directory. |
| `/mentor/[slug]` | ✅ | Mentor profile + booking form. |
| `/guest-lectures` | ✅ | Guest lecture overview. |
| `/become-a-speaker` | ✅ | Speaker application form. |
| `/invite-an-expert` | ✅ | Lecture request form. |
| `/account` | ✅ | User dashboard. |
| `/login`, `/register`, `/reset-password`, `/set-password` | ✅ | Auth flows. |

## 4. What the PRD adds

Version 2.0.0 must introduce:

- **RBAC:** users, roles, permissions, dynamic role management.
- **Profiles:** rich student profiles and expert profiles.
- **Expert verification:** submission → admin review → verified badge.
- **Marketplace:** 1:1 sessions, priority DMs, packages with availability and scheduling.
- **Payments:** commissions, expert wallet, payouts.
- **Reviews:** student ratings after service completion.
- **Notifications:** email + in-app notification center.
- **Hackathons:** align the existing competition engine to the PRD hackathon lifecycle.
- **Admin:** dashboards, analytics, audit logs, transaction management.
- **Animations/2D:** motion system and animated elements on all new pages.

## 5. Architecture decision

Keep the existing Next.js 14 full-stack app. Map PRD modules into domain-organized API routes under `web/app/api/v1/`. Do not introduce a separate NestJS backend now; extract services later if scale requires it.

## 6. Constraints

- Preserve existing UI/UX and design tokens.
- New pages must follow the existing component library and animation standards.
- Existing competitions data and flow must migrate to the PRD hackathon model without breaking current URLs.
- Razorpay remains the payment provider.

## 7. Known risks

- NextAuth.js v4 may need enhancement to support refresh tokens and RBAC cleanly.
- The current single `isAdmin` boolean must evolve into a full role/permission system.
- Scheduling/availability logic must prevent double booking.
- Payment commissions and wallet tracking require immutable financial records.
