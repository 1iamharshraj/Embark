# Current state of the platform

> Captured from the repo at `D:/hapkonic/EmbarkIndia` on 8 Aug 2026.

## 1. What Embark India is

A web platform aimed at **Tier‑2 MBA students** in India. Brand voice: sharp, confident, mentor-like. Tagline theme: *“start before you feel ready.”*

Live domain: `embarkindia.in` (Hostinger shared hosting). Repo: `NarentherMS/EmbarkIndia`, branch `main`.

## 2. How it is built today

- **Static HTML/CSS/JS.** No framework, no build step, no npm.
- One shared stylesheet: `css/gl.css` (linked with `?v=9`).
- Shared nav behaviour: `js/nav.js` (`?v=2`).
- Data arrays: `js/mentors.js` (10 mentors), `js/playbooks.js` (6 streams).
- Backend: **Supabase** (database, auth, file storage, RLS). Wired in `js/db.js` (`?v=6`).
- Deploy: push to GitHub → Hostinger Git connector pulls and deploys.
- `.htaccess` blocks `.md` files from public view and sets HTML cache headers.

## 3. Pages and real status

| Page | Status | Notes |
|------|--------|-------|
| `index.html` | ⚠️ **Broken** | The latest commit replaced the real homepage with a 177-line “Four Original Hero Sections” iframe viewer that references the deleted `heroes/` folder. The previous homepage is in `HEAD~1`. |
| `competitions.html` | ✅ Live | Lists competitions, posters, FAQ, coaching CTA. |
| `competition.html` | ✅ Live | Single competition: registration, round timers, uploads, certificates, winners. |
| `comp-admin.html` | ✅ Live | Admin console for competitions. |
| `account.html` | ✅ Live | Auth, profile, my competitions. |
| `playbooks.html` | ✅ Live | Shelf + categories + 15-item shop grid with demo checkout. |
| `playbook.html` | ✅ Live | Single playbook content from `js/playbooks.js`. |
| `mentorship.html` | 🟡 Static | No booking/payment backend. |
| `mentor-profile.html` | 🟡 Static | Form just shows a success message. |
| `guest-lectures.html` | 🟡 Static | Marketing + FAQ. |
| `become-speaker.html` | 🟡 Form only | No backend. |
| `invite-expert.html` | 🟡 Form only | No backend. |
| Blog | ❌ Removed | `blog.html`, `blog-post.html`, `js/posts.js` were deleted. Some docs still mention them. |

## 4. Working product: case competitions

The only real working product is the case-competition engine. It supports:
- Email/password auth via Supabase.
- Published/draft competitions with date windows.
- Solo or team registration (with institute eligibility rules).
- Round-based submissions (file uploads to Supabase Storage).
- Admin progression of advancing teams.
- Winner flags and canvas-generated certificates.
- Public registration counts and view counts.

## 5. Supabase data model

Tables: `profiles`, `competitions`, `registrations`, `submissions`, `advancements`, `winners`.
Storage buckets: `submissions` (private), `public-assets` (public).
RLS policies enforce who can read/write what. Admin access is granted via `handle_new_user()` to email `narentherms@gmail.com`, which does **not** match the founder email stored in `memory/founder.md` (`ajay.san36@gmail.com`).

## 6. Design system

- Blue palette: accent `#2E6BFF`, deep `#1D4ED8`, navy `#0B1F3A`, background `#F4F7FC`.
- Fonts: Bricolage Grotesque (headings) + Inter (body).
- CSS token names still say `--orange` but hold blue values (legacy naming).
- Components: top utility strip, sticky pill nav, footer with animated path, buttons, FAQ accordion, cards, forms.

## 7. Red flags

1. **Homepage is broken** because the latest commit overwrote `index.html`.
2. **Requirements `.docx` files** are at the repo root and will be deployed publicly. They belong in the ignored `design-source/` folder.
3. **Admin email mismatch** may block the founder from the admin console.
4. **No payments** anywhere; the playbook shop is a visual demo.
5. **Mentorship and guest-lecture forms** do not submit anywhere.
6. **Some docs are stale** and still reference the removed blog.

## 8. Asset inventory

- `assets/categories/` — 12 images.
- `assets/logos/` — company logos.
- `assets/people/` — 11 mentor photos.
- `assets/posters/` — 3 competition posters.
- `assets/vendor/supabase.js` — Supabase client.

Some untracked category images (e.g. `Industry Specific Playbooks.png`) exist locally but are not committed.

## 9. Monetisation blockers

- No payment integration.
- Paid services (mentorship, playbooks, courses, mocks) have no backend.

Until these are fixed, new static pages will not increase revenue.
