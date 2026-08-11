# Phase 5 — Reviews & Notifications

> Add post-service reviews, an in-app notification center, and email delivery for key lifecycle events.

## Goal

Students can rate and review experts after a service is completed. Reviews appear on expert profiles. The platform sends in-app and email notifications for bookings, payments, hackathons, and verification status changes.

## Output

- Review submission after booking/DM/package completion.
- Review display on expert profiles and admin moderation.
- In-app notification center with unread badge.
- Email notifications via Resend queue.
- Notification templates admin view.
- APIs: `/api/v1/reviews`, `/api/v1/notifications`, `/api/v1/admin/notification-templates`.
- Workers for email queue processing.

## Steps

1. **Review model and submission**
   - `Review` table linked to `bookingId` or `dmId`.
   - Student can submit a review only after service status is `COMPLETED`.
   - Review fields: rating (1-5), text, status (`PENDING`, `PUBLISHED`, `HIDDEN`, `REMOVED`).
   - API: `POST /api/v1/reviews`.

2. **Review display**
   - Show average rating and review count on expert cards and profile.
   - List reviews on `/expert/[id]`.
   - Update `ExpertProfile.rating` and `reviewCount` via aggregated calculation or trigger.

3. **Review moderation**
   - Admin can hide/remove reviews in `/admin/marketplace/reviews`.
   - API: `PATCH /api/v1/admin/reviews/[id]`.

4. **Notification data model**
   - `Notification` table: userId, type, title, message, entityType, entityId, read, sentEmail, sentWhatsApp, createdAt.
   - `NotificationTemplate` table: name, channel, subject, body, variables.

5. **In-app notification center**
   - Bell icon in top nav with unread count.
   - Dropdown/panel listing recent notifications.
   - Mark individual or all as read.
   - APIs: `GET /api/v1/notifications`, `PATCH /api/v1/notifications/[id]/read`, `POST /api/v1/notifications/mark-all-read`.

6. **Email integration**
   - Install Resend SDK.
   - Add `RESEND_API_KEY`, `EMAIL_FROM` to env.
   - Create email worker in `web/workers/email.ts` or serverless handler.
   - Queue emails from the `email` BullMQ queue.

7. **Notification events**
   - Welcome email on registration.
   - Booking confirmation + reminder (24h and 1h before).
   - Payment confirmation.
   - Priority DM assigned/responded.
   - Verification status changed.
   - Hackathon registration, deadline reminders, results published, certificate issued.

8. **Notification templates admin**
   - `/admin/notifications/templates` — list and edit templates.
   - Variables highlighted (e.g. `{{userName}}`, `{{expertName}}`).

9. **Verification checklist**
   - [ ] A student can submit a review after a completed booking/DM.
   - [ ] Review appears on expert profile after admin publishes or auto-publishes.
   - [ ] Average rating updates correctly.
   - [ ] User sees unread notification badge in nav.
   - [ ] User can open notification center and mark notifications as read.
   - [ ] Welcome email is queued and sent on registration.
   - [ ] Booking confirmation email is sent after payment.
   - [ ] Booking reminder emails are scheduled and sent.
   - [ ] Verification status change emails are sent.
   - [ ] Admin can view and edit notification templates.

## Risks / notes

- Do not allow review manipulation; only the service consumer can review, and only once per service.
- Email deliverability depends on domain verification. Use Resend test mode until DNS is configured.
- WhatsApp notifications are deferred post-launch unless required earlier.
- Keep notification workers idempotent so duplicate webhook events do not send duplicate emails.
