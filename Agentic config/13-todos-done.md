# Todos and work done so far

## Work already completed (from repo history and conversation log)

- [x] Explored the repo and established the project identity, stack, and service status.
- [x] Created `CLAUDE.md` in the project root with architecture, conventions, and guardrails.
- [x] Set up the `memory/` folder as persistent in-repo AI memory.
- [x] Reorganized files: `gl.css` → `css/`, all JS → `js/`, fixed typo folder name, updated all references in HTML pages.
- [x] Connected the repo to GitHub (`NarentherMS/EmbarkIndia`) and established the Hostinger Git deploy workflow.
- [x] Excluded `design-source/` from git so the large Word docs do not deploy.
- [x] Removed the blog feature entirely (`blog.html`, `blog-post.html`, `js/posts.js`) and cleaned up all nav/footer links and CSS.
- [x] Refreshed the brand palette from orange to blue across the site and `gl.css`.
- [x] Added the “Explore all playbooks” shop section to `playbooks.html` with a demo checkout.
- [x] Redesigned the guest-lectures FAQ and commitments section.
- [x] Redesigned the competitions FAQ to match.
- [x] Built a working case-competition engine: auth, registration, multi-round submissions, admin, winners, storage, RLS.
- [x] Wrote the Supabase schema (`schema.sql`) and cumulative updates (`update-01.sql`, `update-02.sql`, `update-03.sql`).
- [x] Created the playbook content library in `js/playbooks.js` (6 streams).
- [x] Created the mentor profile library in `js/mentors.js` (10 mentors).
- [x] Understood the full platform in this conversation and produced the migration plan stored in this folder.

## Open todos (before rebuild)

- [ ] Fix the broken `index.html` homepage (restore from `HEAD~1` or rebuild in the new app).
- [ ] Move the 5 `.docx` requirements files from the repo root into `design-source/` so they are not deployed.
- [ ] Fix the admin email mismatch in `supabase/schema.sql` (or set up the new app with the founder’s email as admin).
- [ ] Verify the live site loads correctly after the latest push.

## Open todos (new Next.js PWA rebuild)

### Phase 0 — Foundation
- [ ] Initialize Next.js 14 project with TypeScript, Tailwind, ESLint, Prettier.
- [ ] Add Prisma, create schema, set up first migration.
- [ ] Add NextAuth.js with Credentials provider and bcrypt.
- [ ] Create Docker Compose with Postgres and Minio/local file storage.
- [ ] Port design tokens into `tailwind.config.ts`.
- [ ] Add shared layout components: TopBar, Nav, Footer, Button, Eyebrow, Section.
- [ ] Write seed script and verify it populates the local database.

### Phase 1 — Design system + static pages
- [ ] Build the chosen homepage hero section as a React component.
- [ ] Migrate all marketing pages: `/mentorship`, `/guest-lectures`, `/become-speaker`, `/invite-expert`, `/mentor/{slug}`.
- [ ] Migrate playbook pages: `/playbooks`, `/playbook/{slug}`.
- [ ] Migrate competition marketing page: `/competitions`.
- [ ] Add PWA manifest and service worker.
- [ ] Implement responsive nav and mobile menu.
- [ ] Verify all pages match the current blue design system.

### Phase 2 — Auth + account
- [ ] Implement register, login, logout, password reset, profile update.
- [ ] Build `/account` dashboard (my competitions, profile, password).
- [ ] Protect admin routes with middleware.
- [ ] Add admin seed user with founder email.

### Phase 3 — Competitions backend
- [ ] Create API routes for competitions CRUD.
- [ ] Implement public competition list and detail pages from DB.
- [ ] Implement registration flow (solo/team, institute eligibility).
- [ ] Implement round timer and submission upload/download.
- [ ] Implement admin panel: create/edit/publish, registrations, advancing teams, winners.
- [ ] Generate participation and winner certificates.
- [ ] End-to-end test: sign in → register → submit → advance → win → certificate.

### Phase 4 — Playbooks backend
- [ ] Move the 6 stream playbooks and 15 shop playbooks into the `Playbook` table.
- [ ] Render playbooks from DB with skill checklist and progress saved per user.
- [ ] Implement Razorpay checkout for playbook orders.
- [ ] Store orders and unlock access after successful payment.
- [ ] Add admin view for playbook orders.

### Phase 5 — Mentorship + guest lectures backend
- [ ] Persist mentorship booking requests with status workflow.
- [ ] Integrate Razorpay for mentorship session payments.
- [ ] Persist “Become a speaker” applications.
- [ ] Persist “Invite an expert” lecture requests.
- [ ] Build admin views to manage bookings and requests.

### Phase 6 — PWA + deploy
- [ ] Finalise PWA manifest, icons, service worker, offline fallback.
- [ ] Add push notifications for competition reminders.
- [ ] Set up production Postgres on Neon.
- [ ] Set up production file storage (S3/R2).
- [ ] Deploy to Vercel and wire domain.
- [ ] Migrate existing Supabase data (users, competitions, registrations, submissions) to the new DB.
- [ ] Set up redirects from old `.html` URLs to new routes.

### Phase 7 — QA + launch
- [ ] Run full user flows on production-like data.
- [ ] Accessibility and performance audit (Lighthouse).
- [ ] Fix any critical bugs.
- [ ] Launch and update `memory/conversation-log.md`.

## Blockers to revenue

- [ ] No payment integration.
- [ ] Paid services (mentorship, playbooks, courses, mocks) have no backend.

These two items are the highest-priority outcomes after the foundation is in place.
