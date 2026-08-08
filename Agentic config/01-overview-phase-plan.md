# Overview phase plan

The rebuild is split into **8 ordered phases**. Each phase has a clear deliverable that can be verified before moving on. The total scope is large, so the plan is designed to be worked through incrementally.

## Phase summary

| Phase | Goal | Main deliverable | Estimated effort |
|-------|------|-------------------|------------------|
| **0. Foundation** | Set up the new Next.js project, database, auth, and local dev environment. | A runnable app with Docker Compose, Prisma, NextAuth, Tailwind, and the design tokens. | 1–2 days |
| **1. Design system + static pages** | Port shared components and all marketing pages. | All marketing pages render correctly in the new app, with the chosen hero section. | 3–4 days |
| **2. Auth + account** | Implement real auth and the account dashboard. | Users can sign up, sign in, reset password, edit profile, and see their competitions. | 2–3 days |
| **3. Competitions backend** | Rebuild the full competition engine on Postgres. | End-to-end competition flow works: create, register, submit, advance, winners, certificates. | 5–7 days |
| **4. Playbooks backend** | Move playbooks into the DB and add real checkout. | Playbooks rendered from DB, skill progress saved, demo checkout replaced with Razorpay. | 4–5 days |
| **5. Mentorship + guest lectures backend** | Wire up the currently static forms. | Mentorship bookings, speaker applications, and lecture requests persist and can be managed. | 3–4 days |
| **6. PWA + deploy** | Add service worker, manifest, offline support, and deploy. | Installable PWA deployed to Vercel/Render/Railway with file storage connected. | 2–3 days |
| **7. QA + launch** | End-to-end testing, migration of old data, launch. | Old data migrated, redirects in place, live launch. | 2–3 days |

## Hero section choice

Use **Slide 1** from the previous homepage carousel:

> **Eyebrow:** The platform  
> **H1:** Your MBA journey needs more than advice. It needs a roadmap.  
> **Sub:** Embark India helps tier-2 MBA students move from confusion to clarity — from college selection to case competitions, internships, and final placements.  
> **CTAs:** Start your MBA journey · Explore services

**Why:** It is the broadest platform promise, includes all services, and fits the “roadmap” metaphor. It is also the least tied to a single unfinished feature.

## Principles

- **Pareto (80/20).** Ship the simplest version that works, then polish.
- **Keep existing URLs.** Old `.html` paths become redirects or slugs in the new app so SEO is not broken.
- **Backend-first for money features.** Static pages only after the database and payments can support them.
- **One design system.** Reuse the blue palette, fonts, and components everywhere.
- **Local-first dev.** Docker Compose gives a working Postgres + file storage on the laptop so all flows can be tested offline.
