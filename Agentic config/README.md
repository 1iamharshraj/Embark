# Embark India — Next.js PWA Migration Plan

This folder is the single source of truth for rebuilding Embark India as a full-stack, installable PWA with a real PostgreSQL backend and seeded demo data.

## What is in this folder

| File | Purpose |
|------|---------|
| `00-current-state.md` | A snapshot of the existing static site: what works, what is broken, and what is missing. |
| `01-overview-phase-plan.md` | 8 phases with goals, durations, and deliverables at a glance. |
| `02-phase-0-foundation.md` → `09-phase-7-qa-launch.md` | Detailed, actionable plans for each phase. |
| `10-architecture.md` | Target stack, dev/prod infrastructure, and service map. |
| `11-data-model-seed.md` | Prisma schema, table descriptions, and seed data plan. |
| `12-hero-section-selection.md` | Which homepage hero was chosen and why, plus design notes. |
| `13-todos-done.md` | Work already completed and the open backlog. |

## High-level goal

Replace the current hand-written HTML/CSS/JS site with a **Next.js 14 (App Router)** application written in **TypeScript**, styled with **Tailwind CSS**, backed by **Prisma + PostgreSQL**, and installable as a **PWA**.

The new app must support:
- Real user accounts (email/password) and admin access.
- The full case-competition flow (registration, submissions, advancing teams, winners, certificates).
- The playbook library and a real checkout (Razorpay).
- Mentorship booking and guest-lecture requests that actually persist.
- A single, consistent hero section and design system across all pages.
- Local development via Docker (Postgres + file storage) and production via Neon + S3/R2 + Vercel.

## How to use this plan

1. Start with `00-current-state.md` and `01-overview-phase-plan.md`.
2. Work through phases in order; each phase has a verification checklist.
3. Update `13-todos-done.md` as work is completed.
4. Use `10-architecture.md` and `11-data-model-seed.md` as reference while implementing.
