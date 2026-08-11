# Phase 7 — Admin Dashboard & Analytics

> Build the admin dashboard with overview metrics, analytics charts, user management, transaction oversight, hackathon operations, and audit logs.

## Goal

Admins have a unified dashboard to monitor platform health, manage users/experts, oversee payments and hackathons, and review audit logs. The UI reuses existing admin layout and shadcn/ui components.

## Output

- `/admin/dashboard` — overview cards and charts.
- `/admin/users` — user search, filter, edit, suspend, assign roles.
- `/admin/experts` — expert management and verification (extends Phase 2).
- `/admin/marketplace/*` — services, bookings, DMs, packages, reviews (extends Phases 3–5).
- `/admin/payments/*` — transactions, refunds, payouts, commissions (extends Phase 4).
- `/admin/hackathons/*` — full hackathon operations (extends Phase 6).
- `/admin/audit-logs` — filterable audit log viewer.
- `/admin/settings` — platform config (commission rates, supported file types, etc.).
- APIs: `/api/v1/admin/dashboard`, `/api/v1/admin/users`, `/api/v1/admin/audit-logs`, `/api/v1/admin/settings`.

## Steps

1. **Admin dashboard overview**
   - Cards: total users, students, experts, verified experts, active hackathons, total registrations, total submissions, gross revenue, platform revenue.
   - Charts: revenue over time, new users over time, hackathon participation, bookings by status.
   - Use lightweight charting library (Recharts or Tremor) matching the design system.
   - API: `GET /api/v1/admin/dashboard` returns aggregated metrics.

2. **User management**
   - `/admin/users` — table with search, filters (role, status, college), pagination.
   - Edit user profile, suspend/activate, reset access, assign/remove roles.
   - API: `GET/PATCH /api/v1/admin/users`, `POST /api/v1/admin/users/[id]/roles`.

3. **Expert management**
   - Extend Phase 2 admin views with service/booking/review/revenue data.
   - Suspend/reactivate expert accounts.

4. **Marketplace oversight**
   - `/admin/marketplace/services` — list all services; suspend/activate.
   - `/admin/marketplace/bookings` — view all bookings; cancel/refund.
   - `/admin/marketplace/dms` — view DM requests.
   - `/admin/marketplace/packages` — view all packages.
   - `/admin/marketplace/reviews` — moderate reviews.

5. **Payments oversight**
   - `/admin/payments/transactions` — orders/payments with filters.
   - `/admin/payments/refunds` — process refunds.
   - `/admin/payments/payouts` — approve/reject expert payouts.
   - `/admin/payments/commissions` — configure commission rules.

6. **Hackathon oversight**
   - `/admin/hackathons` — list, create, edit, publish, archive.
   - Per-hackathon pages for teams, submissions, judges, evaluations, results, certificates.

7. **Audit logs**
   - `/admin/audit-logs` — filter by actor, action, resource, date range.
   - API: `GET /api/v1/admin/audit-logs`.
   - Ensure every sensitive admin action writes an `AuditLog` row.

8. **Platform settings**
   - `/admin/settings` — edit platform config: default commission, file upload limits, supported file types, email sender, hackathon categories, service categories.
   - Store config in a `PlatformConfig` table or use feature flags.
   - API: `GET/PUT /api/v1/admin/settings`.

9. **Role/permission admin**
   - From Phase 1; ensure it is linked in admin nav.

10. **Verification checklist**
    - [ ] Admin dashboard shows accurate metrics and charts.
    - [ ] Admin can search, filter, and paginate users.
    - [ ] Admin can suspend/activate users and assign roles.
    - [ ] Admin can view expert verification, services, and earnings.
    - [ ] Admin can process refunds and approve payouts.
    - [ ] Admin can manage hackathons end-to-end.
    - [ ] Audit logs capture sensitive actions with actor, action, resource, and timestamp.
    - [ ] Platform settings are editable and effective immediately.
    - [ ] All admin actions require appropriate RBAC permission.
    - [ ] Charts animate on load and update when filters change.

## Risks / notes

- Dashboard queries can be heavy. Add database indexes and cache aggregated metrics in Redis where needed.
- Use Server Components for dashboard data to reduce client bundle size.
- Charts should be lazy loaded to avoid blocking initial render.
- Audit logs can grow large; consider retention policy or archive strategy.
- Admin UI should not leak sensitive user data to unauthorized roles.
