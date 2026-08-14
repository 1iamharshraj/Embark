# Embark — Temp Build Context

> Last updated: 2026-08-14
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

---

## Next: Expert registration wizard + expert dashboard

A full plan is saved at:
`C:/Users/Kavikkannan/.kimi-code/sessions/wd_embark_b8d210ba4092/session_10cf97c7-1fef-4b3e-89a1-484a178c9f4e/agents/main/plans/animal-man-steel-spider-man.md`

This is the next big feature. Implementation was started by a background agent but stopped due to a quota error. It needs to be completed.

### Part A — Schema changes

Add the following fields to the `ExpertProfile` model in `web/prisma/schema.prisma`:

```prisma
socialLinks       Json?    // { linkedIn?: string, twitter?: string, instagram?: string }
country           String?  @default("IN")
currency          String?  @default("INR")
whatsappNumber    String?
onboardingComplete Boolean @default(false)
onboardingStep    Int      @default(0)  // tracks last completed step (1-7)
```

Then create and deploy the migration:

```bash
cd web
npx prisma migrate dev --name add_expert_onboarding_fields
npx prisma migrate deploy
npx prisma generate
```

### Part B — Onboarding persistence API

Create `web/app/api/v1/experts/onboarding/route.ts`.

- `GET`: return the current user's `ExpertProfile` (id, slug, headline, bio, expertise, socialLinks, country, currency, whatsappNumber, onboardingStep, onboardingComplete, etc.). If none exists, return `{ profile: null }`.
- `POST`: upsert `ExpertProfile` for the current `userId`.
  - Generate a unique `slug` from the user's name if missing (kebab-case; append a short cuid suffix if the slug already exists).
  - Update any fields sent in the body.
  - Increment `onboardingStep` if a `step` field is provided and is greater than the current value.
  - Set `onboardingComplete = true` when `step >= 7`.

### Part C — Multi-step onboarding UI

Replace `web/app/expert/onboarding/_components/ExpertOnboardingForm.tsx` with a 7-step wizard.

Create these new components inside `web/app/expert/onboarding/_components/`:

1. `StepProgress.tsx` — a progress bar showing 7 steps. Use the existing project style (white/cream pills, `bg-orangeDeep` for active/completed).
2. `ExpertiseChips.tsx` — selectable chip grid. Default options:
   - Marketing, Finance, Strategy, Product, Consulting, Analytics, Operations, HR, Sales, Entrepreneurship, Supply chain, Data, Design.
3. `ServiceSelector.tsx` — toggle cards for:
   - 1:1 Mentorship, Quick chat, Resume review, Career guidance, Interview prep, Discovery Call, Mock interview, Priority DM, Ask me anything.
4. `AvailabilityStep.tsx` — weekly availability selector. Days 0 (Sunday) through 6 (Saturday), checkbox per day, start/end time selects (15-min increments), "Apply to all" button. Save to `ServiceAvailability`.

Steps:

1. **Welcome + socials**
   - Title: "Hello there!"
   - Subtitle: "In a few moments you will be ready to share your expertise & time."
   - Fields: LinkedIn URL, Twitter/Instagram, Country select (default India), Currency select (default INR).
2. **Expertise**
   - Chip selector.
3. **Services**
   - Toggle cards. For each selected service, create a default `Service` row (type `ONE_ON_ONE` or `PRIORITY_DM`, default price ₹1,499, duration 30 min).
4. **Availability**
   - Weekly schedule.
5. **WhatsApp**
   - Phone input with +91 prefix/default.
6. **Plan**
   - Single card: "Free to list — Embark takes a commission on paid bookings."
7. **Success**
   - "All set!" screen with CTA to dashboard.

Persist state after every step via `POST /api/v1/experts/onboarding`.
On final step, redirect to `/expert/dashboard`.

### Part D — Expert dashboard

Create a new shell and redesign the dashboard home.

1. `web/app/expert/_components/ExpertShell.tsx`
   - Left sidebar with sections:
     - **Manage**: Home, Bookings, Priority DM, Services, Packages, Calendar, Payouts
     - **Your Page**: Analytics, Testimonials, Edit Public Profile
     - **More**: Settings
   - Header bar with public profile link (`/mentor/[slug]`) and copy-to-clipboard button.

2. `web/app/expert/layout.tsx`
   - Wrap all `/expert/*` pages with `ExpertShell`.

3. `web/app/expert/dashboard/page.tsx`
   - Redesign to show:
     - Greeting: "Hi, {firstName}"
     - Setup checklist accordion:
       - Set availability
       - Customize your creator page
       - Add services / packages
       - Set up payouts
       - Add WhatsApp
     - Stats row: sessions, students helped, rating, active services.
     - Upcoming bookings card.
     - Pending priority DMs card.
     - "Get inspired" panel on the right with 3-4 static sample experts.

4. `web/app/expert/dashboard/_components/SetupChecklist.tsx`
5. `web/app/expert/dashboard/_components/StatRow.tsx`

### Part E — Navigation and redirects

- Update `web/components/Nav.tsx` to show "Expert dashboard" for signed-in users who have an `ExpertProfile`.
- In `web/app/expert/onboarding/page.tsx`: redirect to `/expert/dashboard` if `onboardingComplete` is true.
- In `web/app/expert/dashboard/page.tsx`: redirect to `/expert/onboarding` if no `ExpertProfile` exists.

### Part F — Verification

- `npm run build` must pass.
- Log in as `expert1@embark.local` / `Password123`.
- Visit `http://localhost:3000/expert/onboarding`.
- Walk through all 7 steps.
- Confirm landing on `http://localhost:3000/expert/dashboard`.
- Take screenshots of each step and save to `web/e2e/screenshots/`.

### Notes for the implementer

- Use only Tailwind CSS classes. Match the existing design system (white cards, `rounded-2xl`, `bg-cream`, `text-charcoal`, `bg-orangeDeep`, `text-orangeDeep`).
- Use inline SVGs for icons; do not add new icon libraries.
- Keep existing APIs and data structures intact.
- Do not delete the existing verification flow (`/expert/verification`); it runs after onboarding.
- Keep the existing `/expert/services`, `/expert/availability`, `/expert/packages`, `/expert/wallet` pages; just wrap them in the new `ExpertShell` via the layout.

---

## Remaining flows to test after expert dashboard

### Student flow manual steps
1. **Profile photo**: sign in as `student1@embark.local`, visit `/account`, upload photo, refresh, confirm it persists.
2. **Hackathon registration**: visit `/hackathons`, click "dfgh", register with a team name, confirm it appears on `/account`.
3. **Playbook purchase**: visit `/playbook/shop-marketing`, click "Buy for ₹499", confirm it unlocks and appears on `/account`.

### Other test flows
1. **Hackathon admin flow** — create hackathon, add timeline, register as student, evaluate, publish results.
2. **Operations/marketplace flow** — manage mentorship bookings/orders as `opsadmin@embark.local`.
3. **Public visitor flow** — `/mba-colleges-tamilnadu` search/filter/compare.

---

## Known issues / notes

- Earlier migration errors (`StudentProfile.website` and `Order.orderType` missing) are resolved.
- Profile upload previously failed because `S3_PUBLIC_URL` was not set; now `http://localhost:9000` is configured.
- Playbook payment is intentionally mocked; all other flows use real data.
