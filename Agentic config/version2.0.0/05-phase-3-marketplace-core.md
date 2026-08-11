# Phase 3 — Marketplace Core

> Build the expert marketplace: service creation, discovery, 1:1 booking, priority DMs, and packages. UI follows existing design tokens; new pages add motion per the animation guide.

## Goal

Verified experts can create services (1:1 sessions, priority DMs, packages) and set availability. Students can discover experts, view services, book sessions, send priority DMs, and purchase packages. The booking flow handles scheduling and status lifecycle without payments (payments in Phase 4).

## Output

- Expert dashboard: `/expert/services`, `/expert/availability`, `/expert/bookings`, `/expert/dms`, `/expert/packages`.
- Student marketplace: `/experts` (discovery), `/expert/[id]` (profile + services), `/booking/[serviceId]` (booking flow), `/priority-dm/[expertId]`.
- Package detail page: `/package/[id]`.
- APIs: `/api/v1/services`, `/api/v1/availability`, `/api/v1/bookings`, `/api/v1/priority-dms`, `/api/v1/packages`.
- Admin views: `/admin/marketplace/services`, `/admin/marketplace/bookings`, `/admin/marketplace/dms`, `/admin/marketplace/packages`.

## Steps

1. **Expert service management**
   - `/expert/services` — list expert's services; create/edit/delete.
   - Service form: type (1:1, DM, package), name, description, category, duration, price, buffer, cancellation policy, intake questions, meeting method.
   - API: `GET/POST/PUT/DELETE /api/v1/services`.
   - Enforce `service.create` / `service.update` permissions (owner or admin).

2. **Availability**
   - `/expert/availability` — weekly recurring schedule + blackout dates.
   - Generate available slots for the next 4 weeks.
   - API: `GET/POST/PUT/DELETE /api/v1/availability`.
   - Slot generation API: `GET /api/v1/availability/slots?expertId=...&serviceId=...`.

3. **Expert discovery**
   - `/experts` — searchable, filterable grid of expert cards.
   - Filters: expertise, industry, company, b-school, price, rating, verified status, availability.
   - Search by name/company/role.
   - Reuse existing mentor grid styles; add `FadeIn` and hover lift animations.
   - API: `GET /api/v1/experts/search`.

4. **Expert public profile + services**
   - Extend `/expert/[id]` from Phase 2 with services/packages tabs.
   - Service cards link to booking flow.
   - Package cards link to package detail.

5. **1:1 booking flow**
   - `/booking/[serviceId]` — multi-step:
     1. Select available slot.
     2. Answer intake questions.
     3. Review summary.
     4. Proceed to payment (Phase 4).
   - Create `Booking` with status `PENDING_PAYMENT`.
   - Prevent double booking via DB unique constraint on `expertId + scheduledAt` or advisory lock.
   - API: `POST /api/v1/bookings`.

6. **Priority DM flow**
   - `/priority-dm/[expertId]` — form: title, question, context, attachments.
   - Create `PriorityDM` with status `PENDING_PAYMENT`.
   - API: `POST /api/v1/priority-dms`.

7. **Package flow**
   - Expert creates packages in `/expert/packages`.
   - Package includes name, description, validity days, items (service + quantity).
   - Student purchases package on `/package/[id]`; creates `PackagePurchase` with status `ACTIVE`.
   - API: `GET/POST/PUT/DELETE /api/v1/packages` and `POST /api/v1/packages/[id]/purchase`.

8. **Student dashboards**
   - `/account/bookings` — my bookings with status and actions.
   - `/account/dms` — my priority DMs.
   - `/account/packages` — my purchased packages.

9. **Expert dashboards**
   - `/expert/bookings` — incoming bookings; confirm, reschedule, cancel, mark complete.
   - `/expert/dms` — incoming DMs; accept, respond, mark complete.
   - Status updates via `PATCH /api/v1/bookings/[id]`, `PATCH /api/v1/priority-dms/[id]`.

10. **Admin marketplace views**
    - `/admin/marketplace/services` — list all services; suspend if needed.
    - `/admin/marketplace/bookings` — view and moderate bookings.
    - `/admin/marketplace/dms` — view DM requests.
    - `/admin/marketplace/packages` — view packages.

11. **Verification checklist**
    - [ ] Expert can create a 1:1 service, priority DM service, and package.
    - [ ] Expert can set weekly availability and blackout dates.
    - [ ] Student can search and filter experts.
    - [ ] Student can book a slot; booking status is `PENDING_PAYMENT`.
    - [ ] Double booking is prevented for the same expert + slot.
    - [ ] Student can submit a priority DM request.
    - [ ] Student can purchase a package.
    - [ ] Expert can confirm/reschedule/cancel a booking and update status.
    - [ ] Student and expert dashboards show correct records.
    - [ ] Admin can view and suspend services.
    - [ ] New pages use `FadeIn`, hover lifts, and loading skeletons per animation guide.

## Risks / notes

- Availability generation can become complex with time zones and daylight saving time. Store slots in UTC; display in user's local timezone (`Asia/Kolkata` default).
- Do not build full calendar integration in MVP. Manual meeting links are acceptable; Google Calendar integration is post-launch.
- Package usage tracking must decrement remaining quantity correctly. Use transactions.
- Keep the booking UI simple: slot list, not a full calendar grid, for MVP if it speeds delivery.
- All prices stored in paise (INR) to avoid floating-point errors.
