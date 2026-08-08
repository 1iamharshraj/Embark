# Phase 1 — Design system + static pages

> Port every public-facing page from the old static site into the Next.js app, using the chosen hero section and a single shared design system.

## Goal

All marketing and content pages render in the new app, match the existing blue brand, and are responsive. The homepage uses the single selected hero section.

## Output

A set of working routes:
- `/` — homepage with the chosen hero.
- `/mentorship` — marketing page.
- `/guest-lectures` — marketing page.
- `/become-a-speaker` — form page.
- `/invite-an-expert` — form page.
- `/mentor/[slug]` — mentor profile.
- `/playbooks` — playbooks landing.
- `/playbook/[slug]` — single playbook detail.
- `/competitions` — competition list.

These pages may still use static data from the seed or hardcoded data, but the structure and components must be in place.

## Steps

1. **Homepage hero**
   - Build `web/app/(marketing)/page.tsx`.
   - Implement the chosen hero section from `Agentic config/12-hero-section-selection.md`.
   - Create an SVG/React roadmap illustration with the same milestone chips and dashed path.
   - Keep the same eyebrow, heading, subhead, and two CTAs.
   - On mobile, stack the copy above the illustration and convert the roadmap to a vertical timeline.

2. **Reusable homepage sections**
   - Port the sections from the old homepage that are worth keeping:
     - Competition poster strip (uses seeded competition data).
     - “Reality” / pain-points section.
     - College spotlight.
     - “Built for the next generation” stats band.
   - Drop sections that are outdated or no longer fit (e.g. any blog references).

3. **Mentorship marketing page**
   - Port `mentorship.html` content.
   - Build the mentor grid from `mentors` data.
   - Link mentor cards to `/mentor/[slug]`.
   - Keep the stage selector, pricing, journey, and FAQ.

4. **Mentor profile page**
   - Route: `/mentor/[slug]`.
   - Use the `Mentor` table; if not found, return 404.
   - Port tabs (Overview, Mentorship, Guest lectures) and the booking form.
   - The booking form in this phase still just validates input; the backend is added in Phase 5.

5. **Guest lectures page**
   - Port `/guest-lectures` marketing content, FAQ accordion, and commitments.
   - Keep the two CTAs: `/become-a-speaker` and `/invite-an-expert`.

6. **Form pages**
   - `/become-a-speaker`: port the form, validate with Zod, show success state.
   - `/invite-an-expert`: port the form, validate with Zod, show success state.
   - In this phase, forms do not persist; persistence is added in Phase 5.

7. **Playbooks landing**
   - Route: `/playbooks`.
   - Port the 3D-style shelf, category stack, and the 15-item shop grid.
   - Use the `Playbook` table for the shop data.
   - The “Buy now” modal in this phase still validates dummy payment fields; real checkout is Phase 4.

8. **Single playbook page**
   - Route: `/playbook/[slug]`.
   - Render the full playbook content from the `content` JSON field.
   - Build the chapter bar, “Is this you?”, “What you’ll study”, roles, recruiters, timeline, skill checklist, do/don’t, colleges.
   - Skill checklist updates local state only in this phase; DB persistence is Phase 4.

9. **Competitions marketing page**
   - Route: `/competitions`.
   - Port hero, poster strip, “Why compete” section, categories, coaching, FAQ.
   - Pull live competition list from the `Competition` table (still read-only until Phase 3).

10. **PWA basics**
    - Create `public/manifest.json` with name, short_name, icons, theme_colour, background_colour, start_url, display.
    - Add `next-pwa` to `next.config.js` to generate a service worker.
    - Provide a simple offline fallback page.

11. **Verification checklist**
    - [ ] Every route above renders without errors on desktop and mobile.
    - [ ] The homepage hero matches the chosen copy, colours, and fonts.
    - [ ] The topbar, nav, and footer appear on every page.
    - [ ] No 404s for any internal link from the homepage or nav.
    - [ ] All pages are responsive down to 360 px.
    - [ ] The PWA manifest is valid and the service worker registers.

## Risks / notes

- Resist the urge to redesign pages during the port. The goal is to faithfully move the existing design into components first. Polish and redesign can happen in later phases.
- Use Next.js server components for static pages; client components only for interactive parts (forms, carousels, mobile menu).
- Keep images in `public/` or use Next.js `<Image>` with a remote loader if assets move to S3.
