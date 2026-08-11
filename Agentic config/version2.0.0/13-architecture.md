# Embark 2.0.0 — Target Architecture

> Architecture for integrating the PRD backend into the existing Next.js 14 full-stack app.

## 1. Stack decision

The PRD recommends a separate NestJS backend. For 2.0.0 we keep the existing Next.js 14 full-stack architecture to avoid rewriting the frontend. Each PRD module maps to a domain folder under `web/app/api/v1/`. When traffic or team size requires it, a module can be extracted into a NestJS service without changing the frontend contract.

## 2. Application stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14 App Router** | Existing app; full-stack React, SSR, API routes, PWA. |
| Language | **TypeScript** | Type safety across frontend, API, and Prisma. |
| Styling | **Tailwind CSS** | Existing utility-first setup; design tokens already in place. |
| Components | **shadcn/ui + custom components** | Reuse existing `web/components/`; add shadcn where it speeds up admin UI. |
| Forms | **React Hook Form + Zod** | Existing validation pattern. |
| Server state | **Server Components + Server Actions** | Prefer Server Components; TanStack Query where client caching is needed. |
| ORM | **Prisma** | Existing; strong migrations and type-safe queries. |
| Database | **PostgreSQL 15+** | Existing local Docker + Neon/RDS target. |
| Cache / Queue | **Redis + BullMQ** | Sessions, rate limiting, notification queues, certificate jobs. |
| Auth | **NextAuth.js v4 enhanced** | Existing credentials provider; extend with RBAC, refresh tokens, Google OAuth. |
| Payments | **Razorpay** | Existing test integration; support orders, verify, webhooks, refunds, payouts. |
| File storage | **AWS S3 / Cloudflare R2** | Presigned URLs for resumes, submissions, profile images, certificates. |
| CDN | **CloudFront / R2 public URL** | Static assets and public files. |
| Email | **Resend** | PRD recommendation; verification, booking, hackathon notifications. |
| Notifications | **In-app + email + optional WhatsApp** | In-app notification center first; WhatsApp later. |
| Monitoring | **Sentry + Vercel Analytics** | Error tracking and web analytics. |
| Product analytics | **PostHog (optional)** | Funnel tracking when budget allows. |
| Logging | **Pino** | Structured JSON logs on API routes. |
| Deploy | **Vercel** | Existing target. |
| CI/CD | **GitHub Actions** | Lint, type check, build, security checks. |

## 3. Project structure

```text
web/
  app/
    (marketing)/                 # public marketing pages (existing)
    (auth)/                      # login, register, reset (existing)
    (student)/                   # student-specific pages
    (expert)/                    # expert dashboard pages
    (admin)/                     # admin pages (expanded)
    api/
      v1/                        # 2.0.0 domain API routes
        auth/
        users/
        roles/
        permissions/
        students/
        experts/
        services/
        bookings/
        priority-dms/
        packages/
        orders/
        payments/
        payouts/
        reviews/
        hackathons/
        teams/
        submissions/
        evaluations/
        results/
        certificates/
        notifications/
        files/
        admin/
        analytics/
        audit-logs/
      ...existing routes...      # keep until v1 fully replaces them
    layout.tsx                   # global layout with nav/footer/toaster
  components/                    # shared UI components
  lib/
    prisma.ts                    # singleton Prisma client
    auth.ts                      # NextAuth config + RBAC helpers
    rbac.ts                      # permission enforcement helpers
    razorpay.ts                  # Razorpay client
    redis.ts                     # Redis client
    queue.ts                     # BullMQ queues
    s3.ts                        # S3/R2 presigned URL helpers
    logger.ts                    # Pino logger
  prisma/
    schema.prisma                # 2.0.0 schema
    migrations/
    seed.ts                      # seed data
  public/                        # static assets, PWA files
  uploads/                       # local dev uploads
  docker-compose.yml             # Postgres + Redis + MinIO + Next.js + static
  .env.example
```

## 4. Development environment

Docker Compose runs:

- `next`: Next.js dev server on `http://localhost:3000`
- `postgres`: PostgreSQL 15+ on port `5432`
- `redis`: Redis on port `6379`
- `minio`: S3-compatible storage on ports `9000`/`9001`

`.env.example`:

```env
DATABASE_URL="postgresql://embark:embark@localhost:5432/embark?schema=public"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="local-secret-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RESEND_API_KEY=""
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="embark-india"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

## 5. Auth flow

1. User registers/logs in via NextAuth credentials or Google OAuth.
2. On sign-up, create `User` and `StudentProfile` records.
3. JWT/session callbacks fetch `UserRole → Role → Permission` and embed:
   - `id`, `email`, `name`
   - `roles: string[]`
   - `permissions: string[]`
4. Middleware checks authentication for protected routes.
5. API routes validate permission with `requirePermission(req, 'resource.action')` and resource ownership when needed.
6. Refresh tokens stored in `httpOnly` secure cookies, rotated on use.

## 6. RBAC enforcement

Three layers:

1. **Middleware**: route-level protection (student, expert, admin namespaces).
2. **API helpers**: `hasPermission(user, 'expert.verify')`.
3. **Resource guards**: check ownership or assignment before allowing action.

Example:

```ts
// API route
const user = await requireAuth(req);
requirePermission(user, 'hackathon.submission.evaluate');
requireAssignedJudge(user, submissionId);
```

## 7. API conventions

- Base path: `/api/v1/{domain}`
- RESTful resources
- JSON request/response bodies
- Zod validation on every route
- Consistent error shape: `{ error: string, code: string, details?: any }`
- Pagination: `?page=1&limit=20`
- Sort/filter: `?sort=createdAt:desc&status=active`

## 8. File uploads

Use presigned S3 URLs:

1. Client requests upload URL from `/api/v1/files/upload-url`.
2. Backend validates permission and file constraints.
3. Backend returns presigned URL and file ID.
4. Client uploads directly to S3/R2.
5. Client reports success; backend stores metadata.

Constraints:
- Max file size configurable per upload type
- Allowed MIME types validated by signature, not extension
- Public files in public bucket; private files in private bucket with signed download URLs

## 9. Payments

Razorpay flow:

1. Client creates order via `/api/v1/orders`.
2. Backend creates `Order` (pending) + Razorpay order.
3. Client completes Razorpay checkout.
4. Razorpay webhook hits `/api/v1/payments/webhook`.
5. Backend verifies signature, marks `Order` paid, creates `Payment`, `Commission`, and unlocks service.
6. Refunds and payouts supported via admin/expert dashboards.

## 10. Notifications

Channels:

- In-app: notification center + badge count.
- Email: via Resend queue in BullMQ.
- WhatsApp: optional, deferred.

Queue jobs:

- welcome email
- booking confirmation + reminders
- payment confirmation
- hackathon deadline reminders
- certificate issued

## 11. Background jobs

BullMQ queues:

- `email`: send transactional emails.
- `notifications`: in-app and mobile push.
- `certificates`: generate PDFs and upload to S3.
- `payments`: reconcile Razorpay webhooks.
- `payouts`: process expert payout requests.

## 12. Security

- Argon2id password hashing (migrate from bcrypt if feasible).
- Rate limiting on auth and payment endpoints via Redis.
- CSRF protection via SameSite cookies.
- Secure HTTP headers.
- CORS configured for Vercel domains.
- Input validation via Zod on every API route.
- SQL injection protection via Prisma.
- File upload validation by MIME and signature.
- Audit logs for sensitive admin actions.

## 13. PWA

- `manifest.json` with theme color, background color, icons, start URL.
- Service worker via `next-pwa` or Serwist.
- Offline fallback page.
- Push notifications (optional, post-launch).

## 14. Deployment

- Vercel hosts the Next.js app.
- Neon/RDS hosts PostgreSQL.
- ElastiCache/upstash hosts Redis.
- S3/R2 hosts files.
- CloudFront/R2 public URL serves public assets.
- GitHub Actions runs lint, type check, build, and security checks.
