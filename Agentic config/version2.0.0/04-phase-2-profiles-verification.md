# Phase 2 — Profiles & Verification

> Build rich student and expert profiles and the expert verification workflow. Existing account/profile pages keep their current UI; new fields are added behind the same design tokens.

## Goal

Every user has a base profile. Students can add academic and career details. Experts can create a public profile, submit verification documents, and receive a verified badge. Admins review verification requests.

## Output

- `/account/profile` extended with student profile fields.
- `/expert/onboarding` — new expert profile creation flow.
- `/expert/verification` — verification document submission.
- `/expert/[id]` — public expert profile page.
- `/admin/experts` — list of experts with verification status.
- `/admin/experts/[id]/verification` — review and approve/reject verification.
- API routes under `/api/v1/students`, `/api/v1/experts`, `/api/v1/expert-verifications`.

## Steps

1. **Base profile extension**
   - Extend `/account` page to edit name, phone, image, bio, location, LinkedIn, website.
   - Add file upload for profile photo using presigned S3 URL helper.
   - Keep existing password/profile cards intact.

2. **Student profile**
   - Add `/account/profile/student` or extend `/account` with a Student tab.
   - Fields: college, degree, specialization, graduation year, current semester, target industry, target roles, skills, interests, resume URL, portfolio.
   - API: `GET/PUT /api/v1/students/profile`.

3. **Expert profile creation**
   - New route `/expert/onboarding` (student users can apply to become experts).
   - Multi-step form: personal, education, professional, expertise.
   - On submit, create `ExpertProfile` with status `UNVERIFIED` and assign `Expert` role to user.
   - API: `POST /api/v1/experts/profile`.

4. **Expert verification submission**
   - Route `/expert/verification` for existing experts.
   - Upload education proof, employment proof, LinkedIn URL, resume, supporting documents.
   - Create `ExpertVerification` record with `PENDING_VERIFICATION`.
   - API: `POST /api/v1/expert-verifications`.

5. **Public expert profile page**
   - Route `/expert/[id]`.
   - Display headline, bio, credentials, services, packages, reviews, verified badge.
   - Reuse existing mentor profile layout; add verification badge and services section.
   - API: `GET /api/v1/experts/[id]`.

6. **Admin verification review**
   - `/admin/experts` — table with filters: all, pending, verified, rejected, suspended.
   - `/admin/experts/[id]` — expert detail view.
   - `/admin/experts/[id]/verification` — review uploaded docs, approve/reject with note.
   - APIs: `GET /api/v1/admin/experts`, `GET/POST /api/v1/admin/expert-verifications/[id]`.

7. **Privacy controls**
   - Allow students to set profile visibility (public / registered users only).
   - Respect visibility in public profile APIs.

8. **Notification hooks**
   - Queue notifications when verification status changes.
   - Actual email/WhatsApp delivery implemented in Phase 5.

9. **Verification checklist**
   - [ ] A student can complete and save their student profile.
   - [ ] A student can apply to become an expert.
   - [ ] Applying creates an expert profile and assigns the Expert role.
   - [ ] An expert can submit verification documents.
   - [ ] Admin sees pending verifications in `/admin/experts`.
   - [ ] Admin can approve verification; expert profile shows "Embark Verified" badge.
   - [ ] Admin can reject verification with a note; expert can resubmit.
   - [ ] Public expert profile displays services, packages, and reviews sections.
   - [ ] Profile photo uploads work via presigned URL.
   - [ ] Privacy settings are respected in public APIs.

## Risks / notes

- Existing mentors in `Mentor` table can be migrated to `ExpertProfile` records or treated as legacy seed data.
- Verification documents are sensitive; store in private S3 bucket with signed URLs.
- Do not auto-verify experts; admin review is required for trust.
- Keep the expert onboarding UI aligned with existing form patterns (Zod + React Hook Form + Sonner toasts).
