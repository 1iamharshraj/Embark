# Embark 2.0.0 — Overview Phase Plan

> 11 ordered phases to integrate the PRD backend into the existing `web/` frontend while preserving UI/UX and adding animations.

## Phase summary

| Phase | Goal | Main deliverable | Estimated effort |
|-------|------|------------------|------------------|
| **0. Foundation** | Audit current app, design 2.0.0 schema, organize project structure, run first migration. | Extended Prisma schema, domain-based API folders, seed data, no regressions. | 3–4 days |
| **1. Identity & RBAC** | Replace `isAdmin` with users, roles, permissions, sessions, and middleware guards. | RBAC works across all API routes; admin panel uses roles. | 4–5 days |
| **2. Profiles & Verification** | Build student and expert profiles plus the expert verification workflow. | Users can complete rich profiles; experts can apply and be verified. | 4–5 days |
| **3. Marketplace Core** | 1:1 sessions, priority DMs, packages, availability, and scheduling. | End-to-end service creation, discovery, booking, and DM request flows. | 7–9 days |
| **4. Payments, Commissions & Wallet** | Razorpay orders, commission config, expert wallet, payout requests. | Paid bookings unlock services; experts see earnings. | 5–6 days |
| **5. Reviews & Notifications** | Post-service reviews, email and in-app notifications. | Ratings appear on expert profiles; users receive notifications. | 3–4 days |
| **6. Hackathon Platform** | Align competitions engine to PRD hackathon lifecycle: teams, judges, evaluation, certificates. | Full hackathon flow from create to certificate verification. | 7–9 days |
| **7. Admin Dashboard & Analytics** | Admin dashboards, analytics, audit logs, transaction management. | Admins can oversee platform health and operations. | 5–6 days |
| **8. UI Animations & 2D** | Implement motion system, animated components, and 2D elements on new pages. | Consistent animations across new pages without breaking existing UX. | 4–5 days |
| **9. Deploy & Migration** | PWA polish, production infrastructure, data migration from old schema. | App deploys with migrated data and old URLs redirected. | 3–4 days |
| **10. QA & Launch** | End-to-end testing, security review, performance audit, launch. | Stable production app launched. | 4–5 days |

## Principles

- **Backend-first for new features.** Build the data model, API routes, and access control before touching UI.
- **Preserve existing UI/UX.** New pages reuse current components, tokens, and layout patterns.
- **Domain-organized API routes.** Group routes under `web/app/api/v1/{domain}/` matching PRD modules.
- **RBAC everywhere.** Every protected endpoint validates authenticated user + role + permission + resource ownership.
- **Immutable financial records.** Orders, payments, refunds, commissions, and payouts are append-only by design.
- **One animation system.** All new UI uses Framer Motion + Lottie/Rive for 2D, documented in `15-ui-animation-guide.md`.
- **Local-first dev.** All flows testable via Docker Compose before any production deploy.
- **Competitions become hackathons.** The existing `Competition` model evolves into the PRD `Hackathon` model; URLs stay stable.

## Key dependencies

```text
Phase 0 (Foundation)
        ↓
Phase 1 (Identity & RBAC)
        ↓
Phase 2 (Profiles & Verification)
        ↓
        ├─→ Phase 3 (Marketplace Core)
        │         ↓
        │   Phase 4 (Payments & Wallet)
        │         ↓
        │   Phase 5 (Reviews & Notifications)
        │
        └─→ Phase 6 (Hackathon Platform)
                  ↓
        ┌─→ Phase 7 (Admin & Analytics)
        │
        └─→ Phase 8 (UI Animations & 2D)
                  ↓
        Phase 9 (Deploy & Migration)
                  ↓
        Phase 10 (QA & Launch)
```

## Out of scope

Per the PRD, these remain out of scope for 2.0.0:

- AI-based mentor matching
- AI-based hackathon evaluation
- Full LMS/course platform
- Social feed or community forum
- Corporate recruitment marketplace
- Complex gamification
- Subscription memberships
- Microservices architecture
- Elasticsearch/OpenSearch
