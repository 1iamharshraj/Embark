# Embark India — Website Context

> Living reference for the Embark India website: what it is, how it's built, what's done, and what's left to do.
> Last updated: 2026-08-09. Keep this file current when things change.

---

## 1. What it is

**Embark India** — a web platform for MBA students (positioned for Tier-2 B-school talent). A "career operating system" spanning several intended services. Brand voice: sharp, confident, mentor-like. Tagline theme: *"start before you feel ready."*

- **Live domain:** embarkindia.in (Hostinger)
- **Repo:** `NarentherMS/EmbarkIndia` (GitHub), branch `main`
- **Founder:** non-technical, solo. AI/assistant does the coding.
- **Guiding principle:** Pareto (80/20) — ship simple, ship working; don't build infra the site doesn't need yet.

---

## 2. How it's built (architecture)

**Two implementations run side by side:**

1. **Legacy static site** — plain HTML + CSS + vanilla JS in `prototype/`. Live on Hostinger.
2. **New Next.js 14 app** — full-stack PWA in `web/`, with Prisma + PostgreSQL, NextAuth, Razorpay, and Docker Compose support. This is the target replacement for the static site.

**Current local Docker stack (verified live):**

| URL | Service |
|-----|---------|
| http://localhost:3000 | Next.js 14 PWA |
| http://localhost:8080 | Legacy static site |
| http://localhost:9001 | MinIO console |

See `docs/go-live.md` for full deployment options.

```
/prototype/          → legacy static site (.html, css/, js/, assets/)
  .htaccess          → Hostinger cache rule for HTML; blocks .md from public view
  Dockerfile.static  → nginx container for the static site
  nginx-static.conf  → nginx config for the static site
/web/                → Next.js 14 PWA (target replacement)
  app/               → App Router routes
  components/        → shared UI components
  prisma/            → schema + migrations + seed
  public/            → PWA manifest, icons, static assets
/supabase/           → schema.sql + update-0*.sql (run in Supabase, not deployed)
/memory/             → persistent AI memory
/Agentic config/     → phase plans and architecture docs
/docs/               → go-live, components, API reference
```

- **Styling:** one shared stylesheet `prototype/css/gl.css`. All design tokens (colors, fonts) live here.
- **Shared nav:** `prototype/js/nav.js` (sticky nav + mobile burger).
- **Fonts:** Google Fonts — Bricolage Grotesque (display) + Inter (body).
- **Static content data:** hardcoded JS arrays — `js/mentors.js` (MENTORS), `js/playbooks.js` (PLAYBOOKS).
- **Backend:** **Supabase** (database, auth, file uploads, row-level security). Wiring in `js/db.js`; schema in `supabase/`. Public URL + anon key are public by design.

### Deployment
`edit → commit → push to GitHub → Hostinger Git connector deploys`. No build step. Depending on setup, deploy is auto-on-push or a one-click **Deploy** in Hostinger hPanel → Git. Then hard-refresh (Ctrl+F5).

⚠️ **Cache-busting is manual.** When you change `gl.css` or a `.js`, bump its `?v=` number in every page that links it. Currently `gl.css?v=9`. (HTML itself isn't query-versioned.)

⚠️ **Do NOT move the database off Supabase.** Hostinger shared hosting can't replace Supabase's auth/storage/RLS.

---

## 3. Pages (current)

| Page | Purpose | Status |
|------|---------|--------|
| `index.html` | Homepage — hero carousel, services strip, roadmap, final CTA | ✅ live |
| `competitions.html` | Competition listing + FAQ | ✅ live (functional) |
| `competition.html` | Single competition detail (register, rounds, submit) | ✅ live (functional) |
| `comp-admin.html` | Admin panel for competitions | ✅ live (functional) |
| `account.html` | User account / auth | ✅ live |
| `playbooks.html` | Playbooks landing — categories + **"Explore all playbooks" shop** | ✅ live (buy = demo) |
| `playbook.html` | Single stream playbook detail | ✅ live |
| `mentorship.html` | Mentorship marketing page (mentors from `mentors.js`) | 🟡 static, no backend |
| `mentor-profile.html` | Single mentor profile | 🟡 static |
| `guest-lectures.html` | Guest lectures marketing + FAQ | 🟡 static, no backend |
| `become-speaker.html` | "Become a speaker" form | 🟡 form, no backend |
| `invite-expert.html` | "Invite an expert" form | 🟡 form, no backend |

There is **no `blog.html` and no `posts.js`** in the repo (blog is not built, despite older docs mentioning it).

---

## 4. Design system

- **Brand palette: BLUE** (changed from the original orange this session).
  - Accent (bright): `#2E6BFF`
  - Deep / buttons: `#1D4ED8`  · darker hover: `#1740A8`
  - Navy (dark sections/text): `#0B1F3A` · deeper: `#08172B`
  - Cool page background: `#F4F7FC` · soft tint: `#E5EDFF` · light blues: `#5B8CFF`, `#8FB0FF`
  - Token names in `gl.css` are still `--orange` / `--orange-deep` / `--orange-soft` etc., but they now hold **blue** values (renaming was avoided to reduce churn).
- **Kept intentionally non-blue:** functional **reds** (error / "LIVE" / danger / pulse), **social brand colors** (LinkedIn, Instagram gradient, YouTube), small green "success" tints, neutral grays/whites/darks.
- **Fonts:** Bricolage Grotesque (headings) + Inter (body), loaded via Google Fonts `<link>` per page.

---

## 5. The services — real status

| # | Service | Status |
|---|---------|--------|
| 1 | **Case competitions** | ✅ Built & functional (auth, registration, multi-round submissions, admin, storage, RLS) |
| 2 | Mentorship | 🟡 Static marketing page; mentor list hardcoded; no booking/payments/DB |
| 3 | Jobs & internships | ❌ Not built |
| 4 | Courses | ❌ Not built |
| 5 | Guest lecture as a service | 🟡 Static page + forms; no backend |
| 6 | Mock interviews & GDs | ❌ Not built |
| 7 | Stream playbooks | ✅ Built (content). Now also has a paid-style "shop" UI (checkout is a **demo mockup**, not real payments) |
| 8 | Blog | ❌ Not built (no page/data in repo) |

**Two real monetization blockers:** (a) **no payments anywhere**, and (b) money services (mentorship/courses/mocks) have no backend. Building more static pages doesn't move revenue — payments + booking do.

---

## 6. What changed this session (Aug 2026)

All committed & pushed to `main`:

- **`4925ece` Blue palette refresh** — swapped the whole site from orange to a blue system (accent, buttons, backgrounds, gradients, tints), across all pages + `gl.css`. Bumped `gl.css?v=9`.
- **`1765de6` Tighter sections + cleaner playbook covers** — reduced heights of the home "Nine ways up" strip (~42%), and the playbooks "Why Students Need" / "Why Embark India" sections (~72–73%); made the fanned playbook covers image-only (removed overlay text + tint) and wider.
- **`93f8876` → `6250995` Hero showcase band: ADDED then REVERTED** — an iframe-based "four heroes" band below the homepage hero was built and published, then **removed at the founder's request ("very bad")**. ⚠️ Lesson: don't bolt on template/iframe heroes; build natively in `gl.css` and preview big homepage changes first.
- **`8ccf9de` Playbooks "Explore all playbooks" shop** — new section after Playbook Categories: filterable grid of **15 playbooks** (12 interview + 3 case) with prices and **Buy now** → modal (left = write-up + checklist; right = **DEMO checkout**, clearly marked, non-functional).
- **`86943c6` → `0c62d37` Playbook filter** — settled on **tabs** (All / Interview / Case) where Interview & Case have a **▾ dropdown** to jump to a specific playbook (Marketing, Finance, …).
- **`342b082` Guest lectures** — removed "Loved by campuses" testimonials; redesigned **FAQ** into a compact two-column accordion (~60% height); redesigned the **"Our commitments"** band (added header, always-visible descriptions, gradient icons, numbered cards).
- **`f676fa3` Competitions FAQ** — restyled to match the new guest-lectures FAQ (two-column, single-open accordion).

---

## 7. TODO / open items

### High priority (revenue)
- [ ] **Payments — integrate Razorpay.** The playbook "Buy now" modal is a **visual demo only** (marked "payments not live yet"). Real payment = Razorpay checkout (secure card/UPI screen) + Supabase wiring for orders/fulfilment. This is the #1 blocker to selling playbooks.
- [ ] Decide fulfilment: how a paid playbook is delivered (download link, gated page, email).

### Playbook shop polish
- [ ] **Real card stats** for the 9 placeholdered playbooks (Sales, Statistics, Analytics, Economics, Supply Chain, Market Research, Strategy, Product Mgmt, Project Mgmt) — the topics/Qs counts are placeholders. Confirmed-from-screenshot: Marketing, Finance, Consulting, Guesstimates, Market Entry, Pricing.
- [ ] **Confirm prices** — currently all ₹499 except Guesstimates ₹399. Verify the rest.
- [ ] Covers are **blue-toned**; original reference used multicolor. Confirm this is desired.

### Content / pages
- [ ] **Blog** — not built (no page, no data). Build or drop from nav references.
- [ ] The **Platform-overview hero** (from the reverted band) had a "Blog" nav link pointed at `#` since no blog exists — moot now that the band was removed, but note if blog is referenced elsewhere.
- [ ] `competition.html` has a small **per-competition dynamic FAQ** (built from `c.faqs`) still using the OLD `.faq-item` style — not yet restyled to the new accordion. Restyle if consistency is wanted.

### Backend (bigger builds)
- [ ] Mentorship: booking + payments + DB (currently static).
- [ ] Guest lecture forms (`become-speaker`, `invite-expert`): wire to Supabase (currently no backend).
- [ ] Jobs, Courses, Mock interviews: not built.

### Housekeeping
- [ ] Remember to bump `?v=` on `gl.css` / `.js` whenever they change (currently `v=9`).
- [ ] Untracked category images in `assets/categories/` (e.g. "Industry Specific Playbooks.png") have never been committed — decide if they should be used/committed.

---

## 8. Conventions & landmines

- **Match the existing file when editing** — reuse `gl.css` classes (`.btn`, `.btn-primary`, `.wrap`, `.eyebrow`, `.reveal`, …). New self-contained sections use a **scoped `<style>`** block + prefixed classes (e.g. `.glfaq*`, `.shop*`, `.commit*`) so they don't collide with shared styles.
- **Escape user-supplied data** with the `esc()` helper in `db.js` before injecting into HTML. Hardcoded array content is trusted.
- **Never weaken Supabase RLS** policies.
- **No secrets in the repo** beyond the public Supabase anon key.
- **Big/visible changes:** build natively, and **preview before publishing** (a private preview link or local render), especially on the homepage. See `memory/` for the hero-band lesson.
- **Test the real flow**, not just the code — for competitions: sign in → view → register → submit.

---

## 9. Quick deploy checklist

1. Edit files locally.
2. If `gl.css`/`.js` changed, bump `?v=` in every page that links it.
3. `git add … && git commit && git push origin main`.
4. Hostinger: auto-deploy, or hPanel → Git → **Deploy**.
5. Hard-refresh the live page (Ctrl+F5) to bypass cache.
