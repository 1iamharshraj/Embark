# Phase 3 — Competitions backend

> Rebuild the case-competition engine on the new Postgres backend so it is the same as the existing Supabase flow but under our own control.

## Goal

Implement the full competition lifecycle: create/publish, register, submit, advance, win, download certificates.

## Output

- Public pages: `/competitions`, `/competition/[id]`.
- Admin section: `/admin/competitions`, `/admin/competitions/[id]/edit`, `/admin/competitions/[id]/registrations`, `/admin/competitions/[id]/progress`, `/admin/competitions/[id]/results`.
- API routes under `/api/competitions/*` for all data operations.

## Steps

1. **Competition data model**
   - Ensure the `Competition` Prisma model matches all fields from the existing Supabase schema (see `Agentic config/11-data-model-seed.md`).
   - Add a `views` counter and a helper to bump it on detail page load.

2. **Public API routes**
   - `GET /api/competitions` — list published competitions only, ordered by date, include registration count.
   - `GET /api/competitions/[id]` — full competition detail, including rounds, winners, public registration count.
   - `POST /api/competitions/[id]/register` — create a `Registration` if the window is open, the comp is published and free, team size is valid, and institute is in the allowed list (if any).
   - `POST /api/competitions/[id]/submit` — create a `Submission` for the user’s registration and the current round, only if the round window is open and the user advanced from the previous round (or it is round 0).
   - `GET /api/submissions/[id]/download` — return a signed/download URL for the submission file (local dev: serve file directly; production: S3 signed URL).
   - `POST /api/competitions/[id]/certificate` — generate a participation or winner certificate image and return it (re-implement the canvas drawing in a server component or API route, e.g. with `canvas` or `pdf-lib`).

3. **Competition detail page**
   - Route: `/competition/[id]`.
   - Header: title, host, logo, banner, dates, eligibility, team size, fee.
   - Status pill computed from dates (Live / Upcoming / Closed).
   - Round cards with open/closed state and upload UI for open rounds.
   - Side action card: register button, sign-in prompt, or “my competition” panel if already registered.
   - Winners section if winners exist.
   - Per-competition FAQ.
   - “About the host” and contacts sections.

4. **Admin — competition list**
   - Route: `/admin/competitions`.
   - Table showing all competitions (draft + published), status, registration count, dates, actions.
   - Buttons: Edit, Publish/Unpublish, View, Delete.
   - New competition button.

5. **Admin — create/edit competition**
   - Route: `/admin/competitions/new` and `/admin/competitions/[id]/edit`.
   - Form sections: header, rewards, details, contacts, about host, institutes, dates, rounds.
   - File uploads for logo and banners (save to local `uploads/` or S3, store URL in DB).
   - Round editor with dynamic number of rounds, each round having name, brief, type (submission/event), link, opens, closes.
   - Validate all dates before saving.

6. **Admin — registrations**
   - Route: `/admin/competitions/[id]/registrations`.
   - Table of all registrations with team members, college, submissions per round.
   - Download links for submitted files.

7. **Admin — round progression**
   - Route: `/admin/competitions/[id]/progress`.
   - Select a round, see eligible teams, checkboxes to mark who advances.
   - Save creates `Advancement` rows.
   - Show whether each team submitted for the selected round.

8. **Admin — results**
   - Route: `/admin/competitions/[id]/results`.
   - Select finalists (teams that advanced from the last round or all teams if no advancements).
   - Assign Rank 1/2/3.
   - Save creates `Winner` rows and unlocks winner certificates.

9. **Certificates**
   - Re-implement the certificate canvas in the browser or server.
   - For winner certificates, include the rank badge.
   - For participation certificates, unlock after results exist or competition closes.

10. **Verification checklist**
    - [ ] A student can register for a live, free competition.
    - [ ] The student can upload a file for an open round.
    - [ ] The admin can advance a team to the next round.
    - [ ] The admin can mark winners.
    - [ ] A winner can download a winner certificate.
    - [ ] Any registered team can download a participation certificate once results are saved or the comp is closed.
    - [ ] The admin cannot register for a closed competition.
    - [ ] The registration form enforces institute eligibility if a list is set.
    - [ ] The public competitions page only shows published competitions.
    - [ ] Old URLs like `/competition.html?c=...` redirect to the new route.

## Risks / notes

- File upload security: restrict file types to PDF/PPTX, limit file size, store outside the web root, and serve via a controlled API route.
- Round timers must be computed from the server clock; the client can display countdowns but final validation is server-side.
- The certificate canvas can be done client-side for simplicity, but server-side generation is better for consistency.
- This phase is the largest; do not start Phase 4 until the competition flow is fully verified.
