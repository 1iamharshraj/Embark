# Phase 0 — Foundation

> Audit the current app, design the 2.0.0 data model, set up the project structure, and run the first migration so later phases have a stable base.

## Goal

Establish the technical foundation for the 2.0.0 backend inside the existing Next.js 14 app. This phase produces an extended Prisma schema, domain-organized API folders, Redis and queue wiring, structured logging, and a seed script with enough data to exercise every new flow.

## Output

- Extended Prisma schema in `web/prisma/schema.prisma` covering RBAC, profiles, marketplace, payments, hackathons, notifications, and audit logs.
- First successful `npx prisma migrate dev --name v2_0_0_init`.
- Domain-based API folder structure under `web/app/api/v1/`.
- Redis client and BullMQ queue setup in `web/lib/redis.ts` and `web/lib/queue.ts`.
- Pino logger in `web/lib/logger.ts` wired into API routes.
- Updated `docker-compose.yml` with a Redis service.
- Seed script skeleton with roles, permissions, and test users.
- No regressions in existing pages or auth.

## Steps

1. **Audit current `web/`**
   - List all existing pages, API routes, Prisma models, and shared components.
   - Document which routes/models will be extended vs. replaced.
   - Identify pages that must keep identical URLs and UI.

2. **Design 2.0.0 Prisma schema**
   - Copy the schema from `Agentic config/version2.0.0/14-data-model.md` into `web/prisma/schema.prisma`.
   - Add indexes on frequently queried fields: `User.email`, `Role.name`, `Hackathon.slug`, `Service.expertProfileId`, `Booking.status`, `Order.status`.
   - Preserve existing `Playbook`, `PlaybookProgress`, and `Mentor` tables by merging rather than dropping.

3. **Run migration**
   - `npx prisma migrate dev --name v2_0_0_init`
   - Verify `npx prisma generate` succeeds.
   - Confirm no existing data is lost.

4. **Organize API routes by domain**
   - Create folders under `web/app/api/v1/`:
     - `auth`, `users`, `roles`, `permissions`
     - `students`, `experts`, `services`, `bookings`, `priority-dms`, `packages`
     - `orders`, `payments`, `payouts`, `reviews`
     - `hackathons`, `teams`, `submissions`, `evaluations`, `results`, `certificates`
     - `notifications`, `files`, `admin`, `analytics`, `audit-logs`
   - Each folder gets placeholder `route.ts` files returning `501 Not Implemented`.

5. **Set up Redis**
   - Add `redis` service to root `docker-compose.yml`.
   - Create `web/lib/redis.ts` exporting a singleton Redis client (ioredis or @upstash/redis for serverless).
   - Verify connection on `npm run dev` startup.

6. **Set up BullMQ**
   - Install `bullmq`.
   - Create `web/lib/queue.ts` with queues: `email`, `notifications`, `certificates`, `payments`, `payouts`.
   - Add placeholder worker files in `web/workers/` (or serverless-equivalent handlers).

7. **Set up Pino logger**
   - Install `pino`.
   - Create `web/lib/logger.ts`.
   - In dev: pretty logs. In production: JSON logs with request ID.

8. **Set up shared helpers**
   - `web/lib/rbac.ts` — `hasPermission`, `requirePermission`, `requireRole`.
   - `web/lib/s3.ts` — presigned upload/download helpers.
   - `web/lib/razorpay.ts` — Razorpay client singleton.

9. **Seed foundation**
   - Extend `web/prisma/seed.ts` to create:
     - System roles: `Super Admin`, `Admin`, `Operations Admin`, `Hackathon Admin`, `Evaluator`, `Expert`, `Student`, `Support Agent`.
     - Core permissions mapped to PRD resources/actions.
     - 1 super-admin user and 2 test users.
   - Run `npx prisma db seed` and verify counts.

10. **Verification checklist**
    - [ ] `docker compose up` starts Postgres, Redis, and Next.js without errors.
    - [ ] `npx prisma migrate dev` runs successfully.
    - [ ] `npx prisma db seed` creates roles, permissions, and users.
    - [ ] Existing marketing pages still render.
    - [ ] Existing login/register/account flows still work.
    - [ ] `npm run build` passes.
    - [ ] New `api/v1/` placeholder routes return `501`.

## Risks / notes

- Do not drop existing tables. Use additive migrations until migration scripts are proven.
- Keep NextAuth.js v4 config untouched in this phase; RBAC integration happens in Phase 1.
- Redis and BullMQ can be optional in the first local dev pass, but the client must be wired.
- Document every existing table that will be renamed or replaced so the migration phase can handle it safely.
