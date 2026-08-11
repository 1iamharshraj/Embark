# Phase Planning Template Guide

> A reusable layout for structuring and connecting project phases, derived from the Embark India rebuild plan.

Use this guide as a skeleton when you need to break a large project into ordered, verifiable phases for another product or codebase.

---

## 1. What this planning system looks like

A large rebuild or feature rollout is split into **ordered, self-contained phases**. Each phase ships one coherent slice of the product and ends with a verification checklist. Phases are intentionally sequential: later phases depend on the data, auth, components, and APIs built in earlier phases.

The planning system lives in a dedicated folder (e.g. `Agentic config/`) and contains:

| Document | Purpose |
|----------|---------|
| `00-current-state.md` | Snapshot of what exists today, what works, what is broken, and what is missing. |
| `01-overview-phase-plan.md` | One-page summary of all phases, goals, deliverables, and effort estimates. |
| `02-phase-0-foundation.md` → `0N-phase-N-topic.md` | Detailed plan for each phase. |
| `10-architecture.md` | Target stack, project structure, dev/prod environments, auth, and service map. |
| `11-data-model-seed.md` | Schema, entity relationships, and seed data strategy. |
| `12-design-decision.md` (optional) | Locked-in design choices (hero, palette, typography, etc.). |
| `13-launch-checklist.md` | Operational checklist for taking the project live. |
| `13-todos-done.md` | Running log of completed work and open backlog. |

---

## 2. How phases are sequenced

Phases are ordered by dependency, not by page count. The default sequence is:

1. **Foundation (Phase 0)** — Project scaffolding, database, auth, design tokens, shared components, and seed data. Nothing user-facing ships here, but everything else depends on it.
2. **Surface area (Phase 1)** — Static/marketing pages, design system, and public routes rendered with seed data. This proves the visual layer works before wiring real backends.
3. **Identity (Phase 2)** — Real authentication, user profiles, account dashboards, and route guards.
4. **Core money/transaction features (Phases 3–5)** — The business-critical flows, implemented backend-first:
   - Phase 3: primary transactional engine (e.g. competitions).
   - Phase 4: second transactional engine (e.g. playbooks + checkout).
   - Phase 5: supporting workflows that persist requests (e.g. mentorship, applications, bookings).
5. **Packaging + infrastructure (Phase 6)** — PWA, service worker, production database, file storage, deployment, redirects, and data migration.
6. **QA + launch (Phase 7)** — End-to-end testing, performance/accessibility/security audits, bug triage, soft launch, hard launch, and documentation updates.

### Sequencing principles

- **Foundation before features.** You cannot build reliable account/competition/checkout pages on an unsettled stack.
- **Backend before frontend for transactional pages.** Build the data model, API routes, and access control first; polish the UI once the flow is correct.
- **Auth before personalization.** `/account`, admin panels, and saved state all require real sessions.
- **Money features before nice-to-haves.** Checkout, payments, and order management take priority over redesigns or secondary content.
- **Deploy before launch.** Infrastructure, storage, redirects, and data migration get their own phase so launch week is only about QA.

---

## 3. Anatomy of a single phase

Every phase document follows the same structure. This consistency lets anyone jump into a phase and know exactly what is expected.

### 3.1 Title and one-line summary

```markdown
# Phase N — {Name}

> {One-sentence purpose of the phase.}
```

Example:
```markdown
# Phase 3 — Competitions backend

> Rebuild the case-competition engine on Postgres.
```

### 3.2 Goal

A short paragraph describing the outcome in user terms:

- What will users be able to do after this phase?
- What is the measurable success criteria?

### 3.3 Output

A bullet list of concrete deliverables:

- Routes created (e.g. `/competitions`, `/admin/competitions`).
- API namespaces created (e.g. `/api/competitions/*`).
- Data models changed.
- Admin pages added.
- User-facing features enabled.

### 3.4 Steps

Numbered or grouped steps that describe the implementation order. Each step should be:

- Small enough to verify in one sitting.
- Specific about files, routes, or models when possible.
- Ordered to minimize rework.

Typical step groups:
1. Data model changes.
2. API routes / server actions.
3. Public pages / components.
4. Admin pages / workflows.
5. Edge cases and security checks.

### 3.5 Verification checklist

A set of `[ ]` checkboxes that must be ticked before moving to the next phase. Each item should be a concrete, testable action:

```markdown
- [ ] A student can register for a live competition.
- [ ] The admin can advance a team to the next round.
- [ ] Old URLs redirect to the new routes.
```

### 3.6 Risks / notes

Known blockers, fallbacks, security reminders, or decisions that need extra care.

---

## 4. Reusable phase template

Copy this block for each new phase you create.

```markdown
# Phase {N} — {Short name}

> {One-sentence purpose of the phase.}

## Goal

{Describe the user-facing outcome and success criteria.}

## Output

- {Deliverable 1: routes, pages, or APIs.}
- {Deliverable 2: data model changes.}
- {Deliverable 3: admin or user-facing features.}

## Steps

1. **{Step group name}**
   - {Specific action.}
   - {Specific action.}

2. **{Step group name}**
   - {Specific action.}
   - {Specific action.}

3. **{Step group name}**
   - {Specific action.}

## Verification checklist

- [ ] {Testable criterion 1.}
- [ ] {Testable criterion 2.}
- [ ] {Testable criterion 3.}
- [ ] {Old URL redirect or edge case.}

## Risks / notes

- {Risk or fallback note.}
- {Security, performance, or process reminder.}
```

---

## 5. Overview phase plan template

Create a short `01-overview-phase-plan.md` that lists every phase at a glance. This is the first document anyone reads.

```markdown
# Overview phase plan

The project is split into **{N} ordered phases**. Each phase has a clear deliverable that can be verified before moving on.

## Phase summary

| Phase | Goal | Main deliverable | Estimated effort |
|-------|------|------------------|------------------|
| **0. Foundation** | {Goal.} | {Deliverable.} | {Effort.} |
| **1. {Name}** | {Goal.} | {Deliverable.} | {Effort.} |
| **2. {Name}** | {Goal.} | {Deliverable.} | {Effort.} |
| ... | ... | ... | ... |

## Principles

- **Pareto (80/20).** Ship the simplest version that works, then polish.
- **Backend-first for money features.** Static pages only after the database and payments can support them.
- **One design system.** Reuse tokens, components, and conventions everywhere.
- **Local-first dev.** Provide a runnable local environment so all flows can be tested offline.
- **Keep existing URLs alive.** Redirect old paths or preserve slugs so SEO and bookmarks are not broken.
```

---

## 6. Cross-cutting documents

These files are referenced by multiple phases and should be written early.

### 6.1 Current state (`00-current-state.md`)

Use this format:

1. **What the product is** — audience, value proposition, brand voice.
2. **How it is built now** — stack, hosting, dependencies.
3. **Pages/features and status** — a table of routes with status and notes.
4. **Verification status** — which tests/builds pass today.
5. **Security posture** — current protections and gaps.
6. **Known blockers before launch** — ordered list of launch blockers.
7. **Asset inventory** — images, logos, data files, etc.

### 6.2 Architecture (`10-architecture.md`)

Include:

- Application stack table (layer, choice, reason).
- Project structure tree.
- Development environment (Docker Compose, env vars).
- Production environment (hosting, database, storage, CDN).
- Auth flow summary.
- File upload strategy (dev vs. prod paths).
- PWA/SEO checklist.

### 6.3 Data model + seed (`11-data-model-seed.md`)

Include:

- Schema definition.
- Entity relationship description.
- Seed data plan (admin users, test users, sample records for every table).
- Seed running instructions.
- Migration notes from the old system.

### 6.4 Launch checklist (`13-launch-checklist.md`)

Group operational tasks by topic:

- Hosting project setup.
- Production database and migrations.
- Environment secrets.
- Payments (test keys → live keys).
- File storage.
- Email provider.
- Data migration from old system.
- Production build and end-to-end tests.
- Lighthouse / PWA audit.
- DNS cutover.
- Post-cutover cleanup.
- Launch announcement.

---

## 7. How to adapt this for another project

1. **Start with `00-current-state.md`.** Be honest about what exists, what is broken, and what must be preserved.
2. **Define the launch line.** What does "live" mean? List the minimum features required for launch.
3. **Group features into phases.** Use the dependency order: foundation → surface → identity → core features → supporting workflows → packaging → QA/launch.
4. **Write the overview first.** It forces you to name every phase and estimate effort before diving into details.
5. **Write architecture and data model early.** They are referenced by almost every phase.
6. **Make every phase verifiable.** If a phase does not have a checklist, it is not finished.
7. **Keep principles short.** 4–6 principles are enough to guide trade-offs without becoming a manifesto.
8. **Update a running log.** Use `13-todos-done.md` or similar to track what is complete and what is still open.
9. **Do not design new features inside phase docs.** Use separate design-decision documents (`12-*.md`) for choices like hero sections, color palettes, or naming conventions.
10. **Keep the folder as the single source of truth.** Code comments, READMEs, and PR descriptions can summarize, but the plan lives here.

---

## 8. Example phase summary for a generic SaaS product

| Phase | Goal | Main deliverable |
|-------|------|------------------|
| **0. Foundation** | Set up repo, database, auth, design tokens, shared components, and seed data. | A runnable local app with login, nav, footer, and seeded demo data. |
| **1. Marketing surface** | Port or build landing, pricing, about, and feature pages. | All public pages render correctly and are responsive. |
| **2. Identity + billing setup** | Real auth, user profiles, teams/organizations, and subscription plans. | Users can sign up, manage accounts, and view plans. |
| **3. Core workflow A** | Build the primary value-creating feature end-to-end. | Users can create, edit, and manage the main entity. |
| **4. Payments** | Connect checkout, subscriptions, and order/invoice records. | Paid plans can be purchased; access is gated correctly. |
| **5. Supporting workflows** | Add notifications, invites, admin approvals, or integrations. | Secondary requests persist and are manageable. |
| **6. Platform packaging** | PWA, deployment, production infra, redirects, data migration. | App deployed to production with old URLs redirected. |
| **7. QA + launch** | End-to-end testing, audits, bug triage, and public launch. | Live product with no critical bugs and updated docs. |

---

## 9. File naming conventions

Use a consistent prefix so documents sort naturally:

- `00-current-state.md`
- `01-overview-phase-plan.md`
- `02-phase-0-foundation.md`
- `03-phase-1-{topic}.md`
- ...
- `10-architecture.md`
- `11-data-model-seed.md`
- `12-{design-decision}.md` (optional)
- `13-launch-checklist.md`
- `13-todos-done.md`
- `14-phase-template-guide.md` (this file)

---

## 10. Final checklist for a healthy phase plan

- [ ] `00-current-state.md` exists and is honest about the current system.
- [ ] `01-overview-phase-plan.md` lists all phases, deliverables, and estimates.
- [ ] Each phase document follows the Goal → Output → Steps → Verification → Risks structure.
- [ ] `10-architecture.md` defines stack, structure, dev/prod environments, and auth.
- [ ] `11-data-model-seed.md` defines the schema and seed strategy.
- [ ] `13-launch-checklist.md` covers hosting, secrets, data migration, DNS, and monitoring.
- [ ] `13-todos-done.md` is updated as work progresses.
- [ ] No phase is started until the previous phase’s verification checklist is complete.
