# Embark — Temp Build Context

> Last updated: 2026-08-15 (session time)
> This file is a working snapshot of what is done and what still needs to be built.

---

## Test personas

All passwords are `Password123`.

| Email | Role | User ID |
|---|---|---|
| `admin@embark.local` | Super Admin | `cmsrz8r9y0000f6vfl1f8sb8s` |
| `testupload@embark.local` | Student | `cmsrye68z0000sel8p4w75osa` |
| `student1@embark.local` | Student | `cmssn8qed00082v11i4tkzoh4` |
| `expert1@embark.local` | Expert | `cmssn8qh7000b2v11xhy2hrdm` |
| `hackadmin@embark.local` | Hackathon Admin | `cmssn8qju000e2v11d2uugt9t` |
| `opsadmin@embark.local` | Operations Admin | `cmssn8qmj000h2v11dplil3k3` |
| `evaluator1@embark.local` | Evaluator | `cmssn8qpc000k2v11fhmqapp6` |

---

## Completed

### 1. Expert flow
- Tested end-to-end via Playwright.
- `expert1@embark.local` applies at `/become-a-speaker`.
- `admin@embark.local` verifies the application at `/admin/speaker-applications`.
- Status changes from `PENDING` to `VERIFIED`.
- Test saved: `web/e2e/expert-flow.spec.ts`.

### 2. Profile photo upload
- Uses real MinIO storage (`S3_PUBLIC_URL=http://localhost:9000`).
- Photo persists after page refresh.
- Verified with Playwright.
- Test saved: `web/e2e/profile-upload.spec.ts`.

### 3. Hackathon registration visibility
- Student can register at `/hackathons` → hackathon detail → register.
- Registration appears on `/account` under "My hackathons".
- Verified with Playwright.
- Test saved: `web/e2e/hackathon-register.spec.ts`.

### 4. Playbook mock payment
- Playbook purchase is mocked (skips Razorpay) and marks order as `paid`.
- Order shows in `/account` under "Recent orders".
- Verified with Playwright.
- Test saved: `web/e2e/playbook-purchase.spec.ts`.

### 5. Account/profile + admin UI modernization
- Added `app/account/_components/AccountNav.tsx` sidebar nav.
- Added `app/account/layout.tsx` shared layout.
- Reorganized `/account` dashboard with larger avatar, icon-enhanced stats, consistent cards.
- Reorganized `/account/profile` student form into sections: Education, Career goals, Links, About, Visibility.
- Improved `/account/orders` and `/account/mentorship` table styling.
- Improved admin shell: active item accent bar, hover transitions, cleaner user card.
- Improved admin header breadcrumbs and stat cards.

### 6. Real mentor data on mentorship pages
- Removed seeded mock mentors from `prisma/seed.ts` and deleted all `Mentor` rows.
- Added marketplace fields to `ExpertProfile` (`slug`, `image`, `price`, `sessions`, `rating`, `reviewCount`, `batch`, `guestLectures`, `phases`, `streams`, `reviewText`, `reviewWho`, `isAvailable`).
- Migration: `20260814084025_add_expert_profile_marketplace_fields`.
- `/mentorship` now lists verified, public `ExpertProfile` records.
- `/mentor/[slug]` now renders the real expert profile.
- Created one real expert profile for `expert1@embark.local` (slug `expert-one`).
- Removed `/mentor/:slug*` redirect from `next.config.mso`.

### 7. Expert registration wizard + expert dashboard ✅ DONE (2026-08-14)

Committed: `030f750` — `feat(expert): 7-step onboarding wizard + expert dashboard shell`

#### Part A — Schema changes ✅
- Added `socialLinks`, `country`, `currency`, `whatsappNumber`, `onboardingComplete`, `onboardingStep` to `ExpertProfile`.
- Migration deployed.

#### Part B — Onboarding persistence API ✅
- `GET /api/v1/experts/onboarding` — returns current expert profile state.
- `POST /api/v1/experts/onboarding` — upserts profile, generates slug, tracks step progress, marks complete at step 7.

#### Part C — Multi-step onboarding UI ✅
- **`ExpertiseChips.tsx`** — selectable chip grid (16 expertise categories).
- **`ServiceSelector.tsx`** — toggle cards for 9 service types with default pricing.
- **`AvailabilityStep.tsx`** — weekly schedule picker, 15-min increments, "Apply to all".
- **`ExpertOnboardingForm.tsx`** — full 7-step wizard:
  - Step 1: Professional profile + socials (current role, company, years of experience, industry, headline, business school, location, bio, LinkedIn, Twitter, Instagram, country, currency)
  - Step 2: Expertise chips
  - Step 3: Service toggle cards
  - Step 4: Weekly availability
  - Step 5: WhatsApp number (+91 prefix)
  - Step 6: Plan info (free-to-list)
  - Step 7: Success screen → refreshes session with Expert role and redirects to `/expert/dashboard`
  - Persists to API after every step; fully resumable and reloads existing progress on mount.
- **`onboarding/page.tsx`** — redirects to `/expert/dashboard` if `onboardingComplete` is true; whitelisted in `middleware.ts` so incomplete users can complete the wizard.

#### Part D — Expert dashboard shell ✅
- **`ExpertShell.tsx`** — sticky sidebar with Manage / Your Page / More sections, mobile hamburger overlay, header with public profile link and clipboard copy.
- **`app/expert/layout.tsx`** — wraps all `/expert/*` pages in `ExpertShell` (skips `/expert/onboarding`).
- **`SetupChecklist.tsx`** — collapsible accordion with SVG circular progress ring, 5 auto-detected completion items with links.
- **`StatRow.tsx`** — 2×4 responsive stat cards (sessions, students helped, rating, active services).
- **`dashboard/page.tsx`** — redesigned: greeting, checklist, stats, upcoming bookings card, pending DMs card, real earnings snapshot card (replaced static "Get inspired" panel).
- New expert pages built and linked from sidebar:
  - `/expert/bookings` — all 1:1 sessions with status, date, client, and meeting link.
  - `/expert/priority-dms` — all priority DMs with status, student, and amount.
  - `/expert/profile/edit` — edit headline, bio, role, company, expertise, socials.
  - `/expert/settings` — update WhatsApp number.
  - `/expert/analytics` — simple stats: bookings, DMs, total earnings, average rating.
  - `/expert/testimonials` — published reviews from students.

#### Part E — Navigation and redirects ✅
- **`Nav.tsx`** — shows "Expert dashboard" pill link for users with the Expert role (desktop + mobile).
- **`middleware.ts`** — `/expert/onboarding` whitelisted for all authenticated users (not just Expert role); `x-pathname` header injected for server layouts.

#### Part F — Verification ✅
- `npx tsc --noEmit` — 0 errors.
- `npm run build` — exit 0, 137 routes compiled successfully.

### 8. Persona-based post-registration onboarding ✅ DONE (2026-08-15)

#### Schema ✅
- Added `onboardingComplete` and `onboardingRole` to `User`.
- Added `OrganizationProfile` model for colleges/institutes and companies/recruiters.
- Migration: `20260815105707_add_persona_onboarding`.
- Added `Institution` and `Recruiter` roles migration: `20260815112000_add_institution_recruiter_roles` (applied successfully after fixing quoting/casing issue).

#### Roles & seed ✅
- Added `Institution` and `Recruiter` roles to `prisma/seed.ts` with minimal permissions.
- Seeded test users are marked `onboardingComplete: true` so they are not blocked.

#### Auth & middleware ✅
- `web/lib/authOptions.ts` JWT/session callbacks carry `onboardingComplete` and `onboardingRole`.
- `web/middleware.ts` redirects any authenticated user with `onboardingComplete === false` to `/getting-started`.

#### New pages & API ✅
- `web/app/getting-started/page.tsx` + `_components/GettingStartedForm.tsx` — persona selector + conditional profile forms.
- `web/app/api/user/onboarding/route.ts` — creates the right profile and assigns the role:
  - Student → `StudentProfile`
  - Expert → assigns `Expert` role, removes default `Student` role, keeps `onboardingComplete: false`, then redirects to `/expert/onboarding`
  - Institution → `OrganizationProfile(type: INSTITUTION)` + `Institution` role, removes default `Student` role, redirects to `/invite-an-expert`
  - Recruiter → `OrganizationProfile(type: RECRUITER)` + `Recruiter` role, removes default `Student` role
- `web/app/api/auth/register/route.ts` now assigns the default `Student` role and sets `onboardingComplete: false`.
- `web/app/getting-started/_components/GettingStartedForm.tsx` — choosing "Industry Professional" now redirects directly to `/expert/onboarding` (no intermediate intro screen). The button uses the dynamic persona action label ("Create your expert page →").
- `web/app/api/user/onboarding/route.ts` — removed redundant required-field validation for the expert persona (role, company, LinkedIn, expertise) because those details are collected in the dedicated expert onboarding wizard.

### 9. Expert visibility after onboarding ✅ DONE (2026-08-15)
- `web/app/api/v1/experts/onboarding/route.ts` — when the wizard completes, the expert profile is automatically set to `isPublic: true` and `verificationStatus: "VERIFIED"`, so the expert appears immediately on `/mentorship` and is bookable.
- `web/app/package/[id]/page.tsx` — fixed broken "View expert profile" link (was `/experts/${id}`, now `/mentor/${slug}`).

### 10. Expert dashboard as the single home for experts ✅ DONE (2026-08-15)
- `web/app/expert/onboarding/_components/ExpertOnboardingForm.tsx` — clicking "Finish setup" now saves the final step and immediately redirects to `/expert/dashboard` (no intermediate success screen).
- `web/components/Nav.tsx` — the "My account" link is hidden for users with the `Expert` role; they see "Expert dashboard" instead.
- `web/app/expert/_components/ExpertShell.tsx` — added "Account" to the sidebar under More.
- `web/app/expert/account/page.tsx` + `_components/ExpertAccountClient.tsx` — new account management page inside the expert dashboard:
  - Edit name, email (read-only), phone and profile photo.
  - Reuse the password-change form.
  - Delete-account section with password confirmation.
- `web/app/api/account/delete/route.ts` — new self-serve account deletion endpoint; verifies password, deletes the user and cascades related data.
- `web/app/account/page.tsx` — experts who visit `/account` are redirected to `/expert/dashboard`.

### 11. Header mega menu + animated logo ✅ DONE (2026-08-15)
- `web/components/Nav.tsx` redesigned:
  - Logo letters "eMBArk" are individual spans with a staggered bounce animation on hover.
  - For experts, the public links (Mentorship, Competitions, etc.) are replaced by a single "Back to home" link.
  - "Expert dashboard" opens a fixed-width, right-aligned mega menu with three clean columns (Manage, Your Page, More) containing all expert dashboard sidebar links, plus a help card.
  - Mobile menu also lists the expert dashboard sidebar contents and "Back to home".
  - Non-experts see "My account"; logged-out visitors see "Sign in" + "Start free".
- `web/app/globals.css` — added `logo-bounce` and `mega-in` keyframe animations.

#### Notes ✅
- Guest-lecture requests remain open to all authenticated users, including students.
- Temporary diagnostic scripts in `web/scripts/` were removed after the migration was fixed.
- `npx tsc --noEmit` and `npm run build` both pass (131 routes).

---

## Remaining / Not Yet Built

### Remaining flows to test after expert dashboard

#### Student flow manual steps
1. **Profile photo**: sign in as `student1@embark.local`, visit `/account`, upload photo, refresh, confirm it persists.
2. **Hackathon registration**: visit `/hackathons`, click "dfgh", register with a team name, confirm it appears on `/account`.
3. **Playbook purchase**: visit `/playbook/shop-marketing`, click "Buy for ₹499", confirm it unlocks and appears on `/account`.

#### Other test flows
1. **Hackathon admin flow** — create hackathon, add timeline, register as student, evaluate, publish results.
2. **Operations/marketplace flow** — manage mentorship bookings/orders as `opsadmin@embark.local`.
3. **Public visitor flow** — `/mba-colleges-tamilnadu` search/filter/compare.

### Features not yet built

#### Expert payouts page (`/expert/wallet`)
- Route exists and shows wallet summary + payout request + transactions.
- Payout history view and admin approval workflow not yet implemented.

#### Booking flow (student side)
- `/booking/[serviceId]` exists but needs testing against the new services created by the onboarding wizard.

#### Priority DM flow (student side)
- `/priority-dm/[expertId]` exists but needs end-to-end testing.

#### Razorpay live integration
- All payments currently mocked. Live Razorpay keys need to be wired in for production.

#### Email / WhatsApp notifications
- Booking confirmations and DM notifications are not yet sent.

---

## Known issues / notes

- `bullmq` emits a build warning (`@valkey/valkey-glide` not found) — pre-existing, does not affect runtime.
- Earlier migration errors (`StudentProfile.website` and `Order.orderType` missing) are resolved.
- Profile upload previously failed because `S3_PUBLIC_URL` was not set; now `http://localhost:9000` is configured.
- Playbook payment is intentionally mocked; all other flows use real data.
- `/expert/onboarding` is open to any authenticated user so any signed-in user can start the expert flow.
- The existing verification flow (`/expert/verification`) remains intact; it runs after onboarding approval.
- The static "Get inspired" panel on the expert dashboard was replaced with a real earnings snapshot.
- All broken sidebar links (bookings, priority-dms, profile/edit, settings, analytics, testimonials) now have working pages.
