# Legacy Static Site

The original Embark India website is a plain static site: hand-written HTML, a single shared CSS file, and vanilla JavaScript. It is currently live on Hostinger at `embarkindia.in`.

## Architecture

- **No framework, no build step, no npm.**
- **Pages** are individual `.html` files at the repo root. They are the live URLs.
- **Styling** is one shared stylesheet: `css/gl.css`.
- **Shared nav behavior** is in `js/nav.js`.
- **Backend** is Supabase (auth, Postgres, storage, RLS).
- **Fonts** are loaded from Google Fonts in each page head.

## Pages

All pages share the same nav, footer, fonts, and `css/gl.css?v=9`.

| Page | File | Purpose | Status |
|------|------|---------|--------|
| Home | `index.html` | Hero carousel, services strip, stats, impact, final CTA | ✅ Live |
| Competitions list | `competitions.html` | Competition listing, categories, FAQ | ✅ Functional |
| Competition detail | `competition.html` | Single comp detail, registration, rounds, submit, certificate, winners | ✅ Functional |
| Competition admin | `comp-admin.html` | Admin panel for competitions | ✅ Functional |
| Account / auth | `account.html` | Sign in, sign up, password reset, profile, my competitions | ✅ Live |
| Playbooks index | `playbooks.html` | Playbook categories + "Explore all playbooks" shop | ✅ Live |
| Playbook detail | `playbook.html` | Single stream playbook content | ✅ Live |
| Mentorship | `mentorship.html` | Mentor directory and marketing | 🟡 Static |
| Mentor profile | `mentor-profile.html` | Single mentor / speaker profile | 🟡 Static |
| Guest lectures | `guest-lectures.html` | Guest lecture service marketing | 🟡 Static |
| Become a speaker | `become-speaker.html` | Speaker application form | 🟡 Form, no backend |
| Invite an expert | `invite-expert.html` | Institute request form | 🟡 Form, no backend |

## Styles (`css/gl.css`)

- **Design tokens** at the top: colors, fonts, shadows, radii, max-width.
- **Global base**: box-sizing, smooth scroll, typography.
- **Nav**: sticky glass-morphism bar, mobile burger menu.
- **Buttons**: `.btn`, `.btn-primary`, `.btn-green`, `.btn-light`, `.btn-ghost`, `.btn-sm`.
- **Components**: hero blobs, doors, marquees, flip cards, bento grid, bubble cloud, FAQ accordions, carousels, forms, footer, reveal scroll animations.
- **Playbook styles**: tile themes, detail hero, chapter bar, timeline, checklist.
- **Responsive breakpoints**: `1000px`, `960px`, `900px`, `860px`, `820px`, `760px`, `640px`.

## Scripts

### `js/db.js`

The Supabase data layer. Exposes global helper functions.

- **Client**: `sb` (`window.supabase.createClient`)
- **Auth**: `sbUser`, `sbSignIn`, `sbSignUp`, `sbResetPassword`, `sbUpdatePassword`, `sbOnAuthChange`, `sbSignOut`, `sbProfile`, `sbSaveProfile`
- **Competitions**: `dbComps`, `dbComp`, `dbBumpViews`, `dbRegCount`, `dbUploadPublic`
- **Registrations**: `dbMyRegs`, `dbMyReg`, `dbRegister`
- **Submissions**: `dbMySubs`, `dbSubmit`, `dbMyAdvancements`
- **Results**: `dbWinners`
- **Admin**: `dbIsAdmin`, `dbSaveComp`, `dbDeleteComp`, `dbRegsFor`, `dbSubsFor`, `dbAdvFor`, `dbSetAdvancing`, `dbSetWinners`, `dbFileUrl`, `dbAllRegs`, `dbCompAdvRows`
- **Helpers**: `compStatus`, `regWindow`, `roundWindow`, `fmtDate`, `fmtDateTime`, `countdown`, `slugify`, `esc`

### `js/nav.js`

- Adds `.scrolled` class to nav on scroll.
- Toggles `#mob-menu` with `#nav-burger`.

### `js/playbooks.js`

Exports global `PLAYBOOKS` array with 6 stream playbooks:

- General Management
- Marketing
- Finance
- Operations & Supply Chain
- Human Resources
- Business Analytics

Each playbook contains `slug`, `name`, `theme`, `tagline`, `oneLiner`, `forYouIf`, `study`, `roles`, `recruiters`, `skills`, `plan`, `signals`, and `colleges`.

### `js/mentors.js`

Exports global `MENTORS` array with 10 unified mentor/speaker profiles and `STAGE_PHASES` mapping.

Fields include `slug`, `name`, `img`, `role`, `company`, `college`, `batch`, `tier`, `phases`, `streams`, `rating`, `sessions`, `years`, `price`, `guestLectures`, `expertise`, `bio`, and `review`.

## Supabase schema

Run `supabase/schema.sql` plus update files in the Supabase SQL Editor.

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (`id`, `name`, `college`, `is_admin`) |
| `competitions` | Competition metadata, dates, rounds, prizes, FAQs |
| `registrations` | User/team registration for a competition |
| `submissions` | Per-round submission (file path or link) |
| `advancements` | Which teams advanced after each round |
| `winners` | Final ranked winners |

### Functions

| Function | Purpose |
|----------|---------|
| `is_admin()` | Returns admin flag for current auth user |
| `handle_new_user()` | Trigger function creating profile; hardcodes founder admin email |
| `bump_views(cid)` | Increments competition views |
| `reg_count(cid)` | Public count of registrations |

### Storage buckets

- `submissions` — private files at `{user_id}/{comp_id}/round{n}/{filename}`
- `public-assets` — public logos/banners for competitions

### Row Level Security (RLS)

- `profiles`: users read/update own; admins read all.
- `competitions`: public reads published; admins full access.
- `registrations`: authenticated users insert own (within rules); read own; admins full.
- `submissions`: own team only during open round window; read own; admin full.
- `advancements`: participants can read their comp's list; admin full.
- `winners`: public read; admin full.

## Deployment (static site)

1. Edit files locally.
2. If `css/gl.css` or `.js` changed, bump `?v=` in every page that links them.
3. `git add … && git commit && git push origin main`.
4. Hostinger Git connector deploys automatically (or click **Deploy** in hPanel → Git).
5. Hard-refresh live pages (`Ctrl+F5`) to bypass cache.

## Important conventions

- Keep `.html` pages at the repo root. Moving them breaks URLs.
- Always bump `?v=` on `gl.css` and `.js` after changes.
- Escape user data with `esc()` from `db.js` before injecting HTML.
- Never weaken Supabase RLS policies.
- No secrets in the repo beyond the public Supabase anon key.
