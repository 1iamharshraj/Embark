# Phase 8 — UI Animations & 2D

> Implement the shared motion system and add polished animations + 2D elements to all new pages created in previous phases, without changing existing page behavior.

## Goal

All new pages (expert marketplace, booking flow, hackathons, admin dashboards, student/expert dashboards) share a consistent animation language. 2D animated assets enhance empty states, success states, onboarding, and hero sections. Existing pages keep their current behavior unless explicitly refreshed.

## Output

- `web/lib/motion.ts` with animation tokens.
- `web/components/motion/` reusable wrappers: `FadeIn`, `StaggerContainer`, `AnimatedCounter`, `HoverScale`, `SkeletonPulse`, `PageTransition`.
- `web/hooks/use-reduced-motion.ts`.
- Animation assets in `public/animations/`.
- New pages updated with scroll reveals, hover states, loading skeletons, and success animations.
- Existing pages audited for CLS and reduced-motion compliance.

## Steps

1. **Install animation libraries**
   - Add `framer-motion`.
   - Add `lottie-react` for Lottie support.
   - Add `gsap` and `@gsap/react` only if scroll-driven sequences are needed.
   - Keep bundle impact minimal; dynamically import heavy players.

2. **Create animation tokens**
   - `web/lib/motion.ts` exporting durations, easings, stagger values, and common variants.

3. **Create reusable motion components**
   - `FadeIn`: viewport-triggered fade + translate.
   - `StaggerContainer`: parent that staggers children.
   - `AnimatedCounter`: count-up number.
   - `HoverScale`: subtle scale on hover with reduced-motion fallback.
   - `SkeletonPulse`: loading placeholder.
   - `PageTransition`: route-level fade.

4. **Add reduced motion hook**
   - `useReducedMotion()` wrapper around Framer Motion's hook.
   - Disable non-essential animations when user prefers reduced motion.

5. **Expert marketplace animations**
   - `/experts` grid: staggered card reveal on load/filter.
   - Expert card: hover lift + shadow + image scale.
   - Filter sidebar on mobile: slide-in drawer.
   - Search input: focus ring expansion.

6. **Booking flow animations**
   - Step indicator: progress bar width animation, active step pulse.
   - Slot selection: selected slot scale + color transition.
   - Summary panel: slide-in from right on desktop.
   - Success state: checkmark draw + subtle confetti burst (SVG or Lottie).

7. **Hackathon animations**
   - `/hackathons` poster strip: horizontal scroll-linked motion or auto-scroll pause-on-hover.
   - Hackathon detail timeline: line draws as user scrolls; active milestone scales.
   - Team cards: staggered entrance.
   - Submission status: pulsing dot for pending, checkmark for complete.
   - Results page: trophy bounce, rank number count-up, certificate reveal.

8. **Dashboard animations**
   - Admin charts: bars grow from bottom on load.
   - Tables: row fade-in on pagination/sort.
   - Status badges: subtle pulse for pending states.
   - Notification bell: wiggle + badge pop on new notification.

9. **2D animated assets**
   - Empty states: no bookings, no DMs, no hackathons.
   - Success states: payment success, registration success, submission success.
   - Onboarding: student onboarding, expert onboarding.
   - Hero illustrations on new marketing pages (if any).
   - Use Rive or Lottie; provide static fallback PNG/SVG.

10. **Performance pass**
    - Audit with Lighthouse; ensure animation-related frame drops are flagged.
    - Verify only `transform`/`opacity` are animated for motion.
    - Lazy load Lottie/Rive players.
    - Limit concurrent viewport animations.

11. **Existing page audit**
    - Verify existing pages still work with no visual regressions.
    - Add reduced-motion support where missing.
    - Add loading skeletons to existing async sections if absent.

12. **Verification checklist**
    - [ ] `web/lib/motion.ts` exists and is imported by new components.
    - [ ] Reusable motion components render correctly.
    - [ ] `useReducedMotion` disables non-essential motion.
    - [ ] `/experts` grid has staggered reveal and hover lift.
    - [ ] Booking success state has a satisfying animated confirmation.
    - [ ] Hackathon timeline animates on scroll.
    - [ ] Admin charts animate on load.
    - [ ] Empty states show 2D animated illustrations with static fallbacks.
    - [ ] Lighthouse performance score remains ≥ 85 on new pages.
    - [ ] No CLS caused by animations.
    - [ ] Existing pages have no regressions.

## Risks / notes

- Do not over-animate. Motion should feel premium, not distracting.
- Heavy Lottie files hurt mobile performance; prefer Rive or SVG/CSS for simple loops.
- GSAP increases bundle size; only add if scroll sequences justify it.
- Always test reduced motion path.
- Existing pages are intentionally low-priority in this phase; only fix regressions or accessibility gaps.
