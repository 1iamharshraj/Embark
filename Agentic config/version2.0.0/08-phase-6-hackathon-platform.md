# Phase 6 — Hackathon Platform

> Evolve the existing competitions engine into the PRD hackathon platform: full lifecycle, teams, judges, manual evaluation, results, certificates, and verification.

## Goal

The current `/competitions` and `/competition/[id]` flows are rebuilt on the `Hackathon` model while preserving URLs. Admins can create hackathons with timelines, problem statements, rules, and evaluation criteria. Students register individually or in teams, submit solutions, and receive certificates. Judges evaluate assigned submissions manually.

## Output

- Migrated `Competition` → `Hackathon` with timelines, rules, problem statements, criteria.
- Public pages: `/hackathons` (list), `/hackathon/[slug]` (detail), `/hackathon/[slug]/register`, `/hackathon/[slug]/submit`, `/hackathon/[slug]/results`, `/certificate/[certificateId]`.
- Existing `/competitions` and `/competition/[id]` redirect to `/hackathons` and `/hackathon/[id]`.
- Admin pages: `/admin/hackathons`, `/admin/hackathons/[id]/edit`, `/admin/hackathons/[id]/teams`, `/admin/hackathons/[id]/submissions`, `/admin/hackathons/[id]/judges`, `/admin/hackathons/[id]/evaluations`, `/admin/hackathons/[id]/results`, `/admin/hackathons/[id]/certificates`.
- Judge portal: `/judge/hackathons/[id]/submissions`, `/judge/hackathons/[id]/submissions/[submissionId]`.
- APIs under `/api/v1/hackathons`, `/api/v1/teams`, `/api/v1/submissions`, `/api/v1/evaluations`, `/api/v1/results`, `/api/v1/certificates`.

## Steps

1. **Data migration**
   - Migrate `Competition` → `Hackathon` preserving IDs/slugs where possible.
   - Convert rounds into `HackathonTimeline` milestones.
   - Convert `Registration` → `HackathonRegistration`.
   - Convert `Submission` → `HackathonSubmission` + `SubmissionFile`.
   - Convert `Winner` → `HackathonResult`.
   - Add migration script and run against local DB.

2. **Hackathon admin creation**
   - Rebuild `/admin/competitions` as `/admin/hackathons`.
   - Form sections: basic info, timeline, eligibility, rules, problem statement, evaluation criteria, resources, FAQs, settings.
   - File uploads for banner/logo via presigned S3.
   - Status transitions: `DRAFT` → `PUBLISHED` → `REGISTRATION_OPEN` → ... → `CERTIFICATES_ISSUED`.
   - API: `GET/POST/PUT/DELETE /api/v1/admin/hackathons`.

3. **Public hackathon discovery**
   - `/hackathons` — list with filters: status, category, participation mode, fee.
   - Card shows banner, title, dates, status pill.
   - Reuse existing competition card styles; add scroll reveal animations.

4. **Public hackathon detail**
   - `/hackathon/[slug]` — overview, problem statement, rules, timeline, eligibility, prizes, FAQ, registration CTA.
   - Status computed from `HackathonTimeline` dates (server time).

5. **Registration and teams**
   - `/hackathon/[slug]/register` — individual or team registration.
   - Team creation: team name, leader, invite members by email.
   - `HackathonTeam` + `HackathonTeamMember` records.
   - APIs: `POST /api/v1/hackathons/[slug]/register`, `POST /api/v1/teams`, `POST /api/v1/teams/[id]/invite`, `POST /api/v1/teams/invitations/[token]/accept`.

6. **Submission flow**
   - `/hackathon/[slug]/submit` — configurable fields per hackathon.
   - File uploads via presigned S3.
   - Submission versioning until deadline.
   - Lock submissions after `SUBMISSION_DEADLINE`.
   - APIs: `GET/POST/PUT /api/v1/submissions`.

7. **Judge assignment and evaluation**
   - Admin assigns judges to hackathon and assigns submissions.
   - `/judge/hackathons/[id]/submissions` — judge sees assigned submissions.
   - Evaluation form per criterion with score and comment.
   - Weighted score auto-calculated.
   - Evaluation records immutable after finalization.
   - APIs: `POST /api/v1/evaluations`, `POST /api/v1/admin/judge-assignments`.

8. **Results and certificates**
   - Admin finalizes results in `/admin/hackathons/[id]/results`.
   - System calculates rank; admin approves.
   - `POST /api/v1/admin/results/publish` updates `HackathonResult` and hackathon status.
   - Certificate generation queued as background job.
   - PDF generated (canvas/html-to-pdf) with QR code and verification URL.
   - Public certificate verification at `/certificate/[certificateId]`.

9. **Student achievement profile**
   - `/account/achievements` shows hackathons, ranks, certificates.
   - Data pulled from `HackathonRegistration`, `HackathonResult`, `Certificate`.

10. **Notification hooks**
    - Registration, deadline reminders, results published, certificate issued events queue notifications/email (delivered in Phase 5).

11. **Verification checklist**
    - [ ] Existing competition data migrates to `Hackathon` without loss.
    - [ ] `/competitions` and `/competition/[id]` redirect to new routes.
    - [ ] Admin can create a hackathon with timeline, rules, and criteria.
    - [ ] Student can register individually for a hackathon.
    - [ ] Student can create/join a team for a team hackathon.
    - [ ] Submission can be created and updated before deadline.
    - [ ] Submissions lock after deadline; further updates rejected server-side.
    - [ ] Judge can see only assigned submissions and submit scores.
    - [ ] Admin can publish results; winners and ranks are calculated correctly.
    - [ ] Certificates are generated with QR code and verification URL.
    - [ ] Public certificate verification page works.
    - [ ] Student achievement profile lists hackathons and certificates.

## Risks / notes

- Existing live competitions should remain accessible during migration. Plan a redirect strategy, not a hard cut.
- Manual evaluation is MVP; automated evaluation is out of scope.
- Certificate generation is async; do not block the results publish API on PDF generation.
- File uploads for submissions may be large; use direct S3 presigned uploads, not Next.js API route body.
- Judge portal must be a separate route group protected by `hackathon.evaluation.create` permission and assignment ownership.
