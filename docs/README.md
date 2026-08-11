# Embark India — Documentation

This folder contains the complete technical and product documentation for the **Embark India** project.

## What is Embark India?

Embark India is a web platform aimed at **Tier‑2 MBA students in India**. It acts as a "career operating system" spanning competitions, mentorship, stream playbooks, guest lectures, and (eventually) jobs, courses, and mock interviews.

- **Brand voice:** sharp, confident, mentor-like  
- **Tagline theme:** *"Start before you feel ready."*  
- **Founder:** solo, non-technical — relies on AI/assistant for development  
- **Live legacy domain:** `embarkindia.in` (currently the old static site on Hostinger)
- **Future target host:** Vercel, serving the new Next.js 14 app from `web/`

## What's in this docs folder

| File | Purpose |
|------|---------|
| [`README.md`](README.md) | This index. |
| [`project-overview.md`](project-overview.md) | Product definition, audience, services, and current status. |
| [`static-site.md`](static-site.md) | Legacy static HTML/CSS/JS site architecture, pages, and Supabase wiring. |
| [`nextjs-app.md`](nextjs-app.md) | New Next.js 14 PWA architecture, app router, and features. |
| [`home-page.md`](home-page.md) | Next.js homepage sections, components, assets, and animations. |
| [`guest-lectures.md`](guest-lectures.md) | Guest lectures landing page sections, components, and styling. |
| [`playbooks.md`](playbooks.md) | Playbooks landing + detail pages, 3D shelf, shop grid, and components. |
| [`database.md`](database.md) | Prisma and Supabase schemas, data model, and seed data. |
| [`api-reference.md`](api-reference.md) | Public and admin API route reference. |
| [`components.md`](components.md) | Shared React components and static CSS conventions. |
| [`development-setup.md`](development-setup.md) | Local development, Docker, scripts, and verification. |
| [`docker.md`](docker.md) | Complete Docker and Docker Compose guide. |
| [`deployment.md`](deployment.md) | Deployment guides for static Hostinger, Next.js/Vercel, and Docker. |
| [`roadmap-and-status.md`](roadmap-and-status.md) | Phase plan, launch checklist, and open backlog. |
| [`go-live.md`](go-live.md) | Verified local stack status and production deployment options. |

## Two implementations, one project

This repository currently contains **two versions** of the site:

1. **Static site (root `.html` files)** — the original hand-written HTML/CSS/JS website, live on Hostinger. It uses Supabase for auth, competitions, and storage. Most other services are static pages with no backend.
2. **Next.js app (`web/`)** — a full-stack rebuild in progress. It uses Next.js 14 App Router, Prisma + PostgreSQL, NextAuth, Razorpay, and PWA support. It is intended to replace the static site after DNS cutover.

> **Guiding principle:** Pareto (80/20). Ship simple, ship working. Do not build infrastructure the site does not need yet.

For the latest project context, also see:
- [`README.md`](../README.md) (root)
- [`CLAUDE.md`](../CLAUDE.md) (AI/developer orientation)
- [`memory/project.md`](../memory/project.md)
- [`Agentic config/`](../Agentic config/)
