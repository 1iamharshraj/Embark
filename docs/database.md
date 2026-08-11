# Database & Data Model

Embark India has two database systems in the repository:

1. **Supabase** (Postgres) — used by the legacy static site.
2. **Prisma + PostgreSQL** — used by the Next.js app in `web/`.

The Next.js schema was designed to mirror the Supabase competition data so migration is mostly a copy-paste of rows.

---

## Next.js Prisma schema (`web/prisma/schema.prisma`)

### `User`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `email` | String @unique | Login identifier |
| `name` | String | Display name |
| `password` | String | bcrypt hash |
| `college` | String @default("") | |
| `isAdmin` | Boolean @default(false) | Admin flag |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |

Relations: registrations, submissions, progress, orders, bookingRequests, speakerApplications, lectureRequests.

### `Competition`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id | Usually a slug or UUID |
| `title` | String | |
| `host` | String @default("Embark India") | |
| `category` | String @default("General Management") | |
| `banner` | String @default("orange") | Theme key |
| `fee` | Int @default(0) | |
| `teamMin` | Int @default(1) | |
| `teamMax` | Int @default(4) | |
| `eligibility` | String @default("") | |
| `about` | String @default("") | |
| `rules` | String[] | |
| `prizes` | Json? | Array of prize objects |
| `ppo` | Boolean @default(false) | |
| `beginner` | Boolean @default(false) | |
| `draft` | Boolean @default(true) | Publish flag |
| `regOpen` | DateTime | Registration opens |
| `regClose` | DateTime | Registration closes |
| `startAt` | DateTime | Competition starts |
| `endAt` | DateTime | Competition ends |
| `resultAt` | DateTime? | Results declared |
| `rounds` | Json | Array of round objects |
| `eligibilityCriteria` | String[] | |
| `teamStructure` | String[] | |
| `institutes` | String[] | |
| `compStructure` | String[] | |
| `submissionGuidelines` | String[] | |
| `contacts` | Json? | |
| `aboutHost` | String @default("") | |
| `faqs` | Json? | |
| `viewBoost` | Int @default(0) | |
| `banners` | String[] | Image keys |
| `views` | Int @default(0) | |
| `seedRegs` | Int @default(0) | Fake registration count for display |

### `Registration`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `userId` | String | |
| `compId` | String | |
| `teamName` | String | |
| `members` | Json | Array of `{name, email, college}` |
| `createdAt` | DateTime @default(now()) | |

Unique constraint: `[userId, compId]`.

### `Submission`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `compId` | String | |
| `regId` | String | |
| `userId` | String | Denormalized for easier queries |
| `roundIdx` | Int | 0-based round index |
| `filePath` | String? | Storage key |
| `link` | String? | URL submission |
| `note` | String @default("") | |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |

Unique constraint: `[regId, roundIdx]`.

### `Advancement`

| Field | Type | Notes |
|-------|------|-------|
| `compId` | String | |
| `regId` | String | |
| `roundIdx` | Int | |
| `createdAt` | DateTime @default(now()) | |

Primary key: `[compId, regId, roundIdx]`.

### `Winner`

| Field | Type | Notes |
|-------|------|-------|
| `compId` | String | |
| `regId` | String @unique | |
| `rank` | Int | |
| `teamName` | String | Snapshot at win time |
| `createdAt` | DateTime @default(now()) | |

### `Playbook`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `slug` | String @unique | |
| `name` | String | |
| `theme` | String | `orange`, `dark`, `green` |
| `category` | String | `stream`, `interview`, `case` |
| `tagline` | String | |
| `oneLiner` | String | |
| `content` | Json | Full playbook object |
| `price` | Int @default(499) | |
| `rating` | Float @default(4.6) | |
| `meta` | String | e.g. "42 topics · 120+ Qs" |
| `order` | Int @default(0) | |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |

### `PlaybookProgress`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `userId` | String | |
| `playbookId` | String | |
| `checked` | Int[] | Indices of checked skills |
| `updatedAt` | DateTime @updatedAt | |

Unique constraint: `[userId, playbookId]`.

### `Order`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `userId` | String | |
| `type` | String @default("playbook") | `playbook` or `mentorship` |
| `playbookId` | String? | For playbook orders |
| `bookingRequestId` | String? | For mentorship orders |
| `amount` | Int | In paise |
| `status` | String @default("pending") | `pending`, `paid`, `failed`, `refunded` |
| `paymentId` | String? | Razorpay payment id |
| `paymentSignature` | String? | |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |

### `Mentor`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `slug` | String @unique | |
| `name` | String | |
| `image` | String | Image path |
| `role` | String | |
| `company` | String | |
| `college` | String | |
| `batch` | String | |
| `tier` | String | `industry` or `alumni` |
| `phases` | Int[] | 1-5 journey phases |
| `streams` | String[] | Relevant streams |
| `rating` | Float | |
| `sessions` | Int | |
| `years` | Int | |
| `price` | Int | Session price |
| `guestLectures` | Boolean @default(false) | |
| `expertise` | String[] | |
| `bio` | String | |
| `reviewText` | String | |
| `reviewWho` | String | |

### `BookingRequest`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `userId` | String | |
| `mentorId` | String | |
| `topic` | String | |
| `status` | String @default("pending") | `pending`, `confirmed`, `paid`, `cancelled`, `completed` |
| `amount` | Int? | |
| `paymentId` | String? | |
| `note` | String @default("") | Admin note |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |

### `SpeakerApplication`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `name` | String | |
| `email` | String | |
| `role` | String | |
| `company` | String | |
| `linkedIn` | String | |
| `experience` | String | |
| `vertical` | String | |
| `city` | String? | |
| `format` | String | |
| `topics` | String | |
| `status` | String @default("pending") | `pending`, `verified`, `rejected` |
| `userId` | String? | Optional relation |
| `note` | String @default("") | |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |

### `LectureRequest`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `institute` | String | |
| `name` | String | |
| `email` | String | |
| `phone` | String? | |
| `vertical` | String | |
| `engagement` | String | |
| `format` | String | |
| `dates` | String? | |
| `audienceSize` | String | |
| `budget` | String | |
| `message` | String? | |
| `status` | String @default("pending") | |
| `userId` | String? | Optional relation |
| `note` | String @default("") | |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |

### `PasswordResetToken`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `email` | String | |
| `token` | String @unique | |
| `expiresAt` | DateTime | |
| `createdAt` | DateTime @default(now()) | |

Indexed by `email`.

## Migrations

Files in `web/prisma/migrations/`:

1. `20260808011929_init` — initial schema.
2. `20260808023536_add_password_reset_token` — adds `PasswordResetToken`.
3. `20260808105736_add_order_booking_request` — adds `bookingRequestId` and `type` to `Order`.
4. `20260808105850_add_speaker_user_id` — adds `userId` to speaker/lecture requests.
5. `20260808105951_add_request_notes` — adds `note` columns to requests.

## Seed data (`web/prisma/seed.ts`)

Running `npm run db:seed` (or `npx prisma db seed`) creates:

- 1 admin user (`ajay.san36@gmail.com`)
- 2-3 test student users
- 5 competitions with shifted dates (live, upcoming, closed)
- Sample registrations, submissions, advancements, winners
- 6 stream playbooks + 15 shop playbooks
- 10 mentors
- 2 sample speaker applications
- 2 sample lecture requests
- 1 paid + 1 pending order

---

## Supabase schema (`supabase/schema.sql`)

The static site uses Supabase directly from the browser via `js/db.js`.

### Tables

- `profiles` — `id uuid` (refs `auth.users`), `name`, `college`, `is_admin`, `created_at`.
- `competitions` — competition metadata with JSONB rounds/prizes/FAQs.
- `registrations` — `comp_id`, `user_id`, `team_name`, `members` JSONB.
- `submissions` — `comp_id`, `reg_id`, `round_idx`, `file_path`, `link`, `note`.
- `advancements` — `(comp_id, reg_id, round_idx)` PK.
- `winners` — `(comp_id, reg_id)` PK, `rank`, `team_name`.

### Functions

- `public.is_admin()` — returns `is_admin` for current auth user.
- `public.handle_new_user()` — trigger creating profile; founder email becomes admin.
- `public.bump_views(cid text)` — increments `views` on live competitions.
- `public.reg_count(cid text)` — counts registrations for a competition.

### Triggers

- `on_auth_user_created` on `auth.users` → calls `handle_new_user()`.

### Storage

- `submissions` bucket — private, path `{user_id}/{comp_id}/round{n}/{filename}`.
- `public-assets` bucket — public, for logos/banners.

### RLS policies

All core tables have RLS enabled. Policies enforce:

- Users can only read/update their own profiles.
- Published (`draft=false`) competitions are publicly readable.
- Registrations can only be inserted by authenticated users for themselves, within the registration window, with valid team sizes, and eligible institutes.
- Submissions can only be inserted/updated by the owning team during an open round, and only if advanced from the prior round.
- Advancements are readable by participants of the same competition.
- Winners are publicly readable.

## Migration path from Supabase to Prisma

The `web/scripts/migrate-supabase.ts` script is intended to migrate:

- Users (force password reset because hashes differ)
- Competitions (copy rows, parse dates)
- Registrations and submissions
- Winners and advancements
- Orders (if any)

After migration:

1. Run `npx prisma migrate deploy` in production.
2. Execute the migration script against the old Supabase project and new Neon database.
3. Force all migrated users to reset their passwords because Supabase and bcrypt hashes are incompatible.
4. Verify counts and spot-check a few competition flows.
