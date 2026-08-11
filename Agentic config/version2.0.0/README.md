# Embark 2.0.0 — Phase Plan

> Rebuild Embark into a full career ecosystem: expert marketplace + hackathon platform, integrated into the existing Next.js 14 frontend without changing the current UI/UX.

## Purpose of this folder

This folder contains the ordered phase plan for implementing the Embark 2.0.0 product defined in `docs/prd.md`. It follows the layout in `Agentic config/14-phase-template-guide.md`.

## What 2.0.0 delivers

The current `web/` application is a Next.js 14 full-stack app with:
- Marketing pages
- Competitions (creation, registration, submissions, advancement, winners, certificates)
- Playbooks (listing, purchase via Razorpay, progress tracking)
- Mentorship directory and booking requests
- Guest lecture requests and speaker applications
- Basic auth (NextAuth.js + credentials)
- Admin panel for competitions, orders, mentorship, speakers, lectures

Version 2.0.0 adds the product modules from the PRD:
- Full RBAC (users, roles, permissions, resource-level access)
- Rich student and expert profiles
- Expert verification workflow
- Expert marketplace: 1:1 sessions, priority DMs, packages
- Scheduling and availability
- Payments, commissions, expert wallet, payouts
- Reviews and ratings
- Complete hackathon lifecycle (the existing competitions engine, aligned to PRD terminology)
- Notifications (email + in-app)
- Admin dashboard, analytics, audit logs
- UI animations and 2D animated elements for all new pages

## Architecture choice

The PRD recommends a separate NestJS backend. For 2.0.0 we keep the existing Next.js 14 full-stack architecture and map PRD modules into domain-organized API routes under `web/app/api/v1/`. This avoids a frontend rewrite and lets us integrate backend logic behind the current UI.

When scale genuinely requires it, individual modules can later be extracted into a NestJS service without changing the frontend contract.

## How to use this plan

1. Read `00-current-state.md` for the baseline.
2. Read `01-overview-phase-plan.md` for the phase summary.
3. Work through phases in order. Each phase has a verification checklist.
4. Reference `13-architecture.md`, `14-data-model.md`, and `15-ui-animation-guide.md` while implementing.
5. Use `16-launch-checklist.md` before going live.

## Documents

| File | Purpose |
|------|---------|
| `00-current-state.md` | Baseline of the current `web/` app. |
| `01-overview-phase-plan.md` | 11 phases at a glance. |
| `02-phase-0-foundation.md` | Audit, schema design, migrations, project structure. |
| `03-phase-1-identity-rbac.md` | Auth upgrade + role/permission system. |
| `04-phase-2-profiles-verification.md` | Student/expert profiles and verification. |
| `05-phase-3-marketplace-core.md` | 1:1 sessions, priority DMs, packages, scheduling. |
| `06-phase-4-payments-commissions.md` | Razorpay, commissions, wallet, payouts. |
| `07-phase-5-hackathon-platform.md` | Full hackathon lifecycle mapped to current competitions. |
| `08-phase-6-notifications-admin.md` | Email + in-app notifications and admin foundation. |
| `09-phase-7-admin-analytics.md` | Admin dashboards, analytics, audit logs. |
| `10-phase-8-ui-animations-2d.md` | Animation system + 2D animated elements for new pages. |
| `11-phase-9-deploy-migration.md` | PWA, production deploy, data migration. |
| `12-phase-10-qa-launch.md` | End-to-end QA and launch. |
| `13-architecture.md` | Target stack, structure, auth, security, deployment. |
| `14-data-model.md` | Prisma schema and seed data for 2.0.0. |
| `15-ui-animation-guide.md` | Standards for animations and 2D elements. |
| `16-launch-checklist.md` | Production go-live checklist. |
