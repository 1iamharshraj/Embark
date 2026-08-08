# Phase 5 — Mentorship + guest lectures backend

> Wire the currently static mentorship and guest-lecture forms to the database so they become real workflows.

## Goal

- Mentorship booking requests persist, can be paid for, and can be managed by admin.
- Speaker applications and institute lecture requests persist and can be managed by admin.

## Output

- `/mentor/[slug]` booking form creates a `BookingRequest`.
- `/account/mentorship` shows the user’s booking requests.
- `/become-a-speaker` creates a `SpeakerApplication`.
- `/invite-an-expert` creates a `LectureRequest`.
- Admin pages to manage all three request types.

## Steps

1. **Mentor booking flow**
   - On `/mentor/[slug]`, the form collects: name, email, topic.
   - Create a `BookingRequest` with status `pending` and the mentor’s price.
   - Show the user a confirmation: “We’ll confirm slots on email/WhatsApp within a day.”
   - Add an admin page `/admin/mentorship` to see pending requests.
   - Admin can set status to `confirmed` and send a payment link, or `cancelled` with a note.

2. **Mentorship payment**
   - Reuse the Razorpay order flow from Phase 4.
   - Create an `Order` for a mentorship booking (or add a `type` field to `Order` to distinguish playbook vs mentorship).
   - After payment, mark `BookingRequest.status` as `paid` and send a confirmation to the user.
   - After the session, admin can mark as `completed`.

3. **Speaker application flow**
   - On `/become-a-speaker`, the form validates and creates a `SpeakerApplication` with status `pending`.
   - Show a success state: “Application received. Verification takes about a week.”
   - Admin page `/admin/speaker-applications` lists applications.
   - Admin can approve → `verified`, or reject → `rejected`.

4. **Lecture request flow**
   - On `/invite-an-expert`, the form validates and creates a `LectureRequest` with status `pending`.
   - Show success state: “We’ll write back within 2 working days with a shortlist.”
   - Admin page `/admin/lecture-requests` lists requests.
   - Admin can update status: `shortlisted`, `confirmed`, `completed`, `cancelled`.

5. **Admin notifications**
   - For MVP, print a daily summary of new requests to the console or a simple admin dashboard widget.
   - In production, send email alerts to `info@embarkindia.in` when a new request arrives.

6. **User-facing request history**
   - Add `/account/requests` showing mentorship bookings, speaker applications, and lecture requests submitted by the logged-in user.

7. **Verification checklist**
   - [ ] A user can submit a mentorship booking request for a mentor.
   - [ ] The admin sees the request in the dashboard and can confirm it.
   - [ ] The user can pay for a confirmed session via Razorpay.
   - [ ] After payment, the booking status is `paid`.
   - [ ] A professional can submit a speaker application and see it in their account.
   - [ ] An institute can submit a lecture request and see it in their account.
   - [ ] Admin can approve/reject applications and update request statuses.
   - [ ] Users receive a clear status message on each page after submitting.

## Risks / notes

- Do not build a full calendar/scheduling system in this phase. Use status + manual email/WhatsApp coordination for the MVP.
- If the user is not logged in, allow booking but require email/name; however, storing it against a logged-in user is cleaner and lets them track history.
- Keep the application/request forms simple. Extra features (file uploads, CVs) can come later.
