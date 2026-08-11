# Components & UI

This document covers the shared UI in both the static site and the Next.js app.

## Next.js shared components (`web/components/`)

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Polymorphic button/link with variants (`primary`, `ghost`, `green`, `light`) and sizes (`sm`, `default`). |
| `Container.tsx` | Max-width wrapper (`max-w-6xl mx-auto px-6 lg:px-8`). |
| `Eyebrow.tsx` | Small uppercase label with dashed line used above headings. |
| `FAQ.tsx` | Accordion FAQ component. |
| `Footer.tsx` | Site footer with service links, social icons, contact. |
| `Nav.tsx` | Sticky responsive nav with session-aware sign-in/out. |
| `TopBar.tsx` | Top contact bar with email, phone, social links, free consultation CTA. |
| `Section.tsx` | Reusable section wrapper (eyebrow, title, subtitle, dark mode). |
| `CompetitionCard.tsx` | Card for competition listings. |
| `PlaybookCard.tsx` | Card for playbooks with cover gradients and buy/read action. |
| `MentorCard.tsx` | Mentor listing card. |
| `PosterStrip.tsx` | Auto-scrolling competition posters on homepage. |
| `RazorpayButton.tsx` | Loads Razorpay checkout, creates order, verifies payment. |
| `PwaInstallPrompt.tsx` | Browser PWA install banner using `beforeinstallprompt`. |
| `MentorshipPageClient.tsx` | Mentorship landing page content. |
| `MentorProfileClient.tsx` | Mentor detail + booking form. |
| `PlaybooksPageClient.tsx` | Playbooks landing page orchestrator. |
| `PlaybookDetailClient.tsx` | Full playbook reader with access/purchase/progress. |
| `PlaybookShelf.tsx` | 3D perspective bookshelf for stream playbooks. |
| `DomainMarquee.tsx` | Infinite scrolling MBA domain pills. |
| `PlaybookCategories.tsx` | Fanned category stack + expandable 5-card grid. |
| `ShopGrid.tsx` | Shop filter/sort grid + buy modal with Razorpay. |
| `WhyStudentsNeed.tsx` | Pain-point cards + side panel. |
| `WhyEmbarkPlaybooks.tsx` | 6 feature items with dashed connectors. |
| `TestimonialCarousel.tsx` | Auto-scrolling testimonials with prev/next + dots. |
| `PlaybookHero.tsx` | Theme-aware detail hero with ghost initials. |
| `PlaybookContent.tsx` | Sticky chapter bar + all detail sections + checklist. |
| `GuestLecturesHero.tsx` | Guest lectures hero with people wall and two entry doors. |
| `LogoMarquee.tsx` | Infinite logo marquee for campuses and companies. |
| `FlipCards.tsx` | Three interactive 3D flip cards (Enrolment / Engagement / Employability). |
| `ExpertiseTabs.tsx` | Bento engagement formats + bubble-cloud expertise areas. |
| `HowItWorks.tsx` | Three tilted step cards for the guest lectures flow. |
| `SpeakerCarousel.tsx` | Speaker spotlight carousel. |

## App-specific components

- `web/app/account/_components/ProfileForm.tsx` — name/college update form.
- `web/app/account/_components/PasswordForm.tsx` — change password form.
- `web/app/account/mentorship/_components/PayButton.tsx` — Razorpay payment for confirmed bookings.
- `web/app/admin/competitions/_components/CompetitionForm.tsx` — create/edit competition.
- `web/app/admin/competitions/[id]/progress/_components/ProgressPageClient.tsx` — advance teams.
- `web/app/admin/competitions/[id]/results/_components/ResultsPageClient.tsx` — assign winners.
- `web/app/admin/mentorship/_components/BookingActions.tsx` — booking status actions.
- `web/app/admin/speaker-applications/_components/SpeakerActions.tsx` — speaker approval.
- `web/app/admin/lecture-requests/_components/LectureActions.tsx` — lecture request actions.
- `web/app/competition/[id]/_components/CompetitionDetailClient.tsx` — competition detail interactivity.

## Static site conventions

The static site uses a single shared stylesheet `css/gl.css` plus scoped `<style>` blocks for complex new sections.

### Reusable classes

| Class | Usage |
|-------|-------|
| `.wrap` | Max-width container |
| `.btn` / `.btn-primary` | Buttons |
| `.btn-green` / `.btn-light` / `.btn-ghost` / `.btn-sm` | Button variants |
| `.eyebrow` | Small uppercase section label |
| `.sec-head` | Section heading style |
| `.reveal` | Scroll-reveal animation |
| `.flip` | Flip card container |
| `.car-*` | Carousel helpers |

### Scoped section prefixes

New self-contained sections use scoped `<style>` blocks with prefixed classes to avoid collisions:

- `.glfaq*` — guest lectures and competitions FAQ accordions
- `.shop*` — playbook shop grid and modal
- `.commit*` — guest lecture commitments band

### Responsive breakpoints

- `1000px`, `960px`, `900px`, `860px`, `820px`, `760px`, `640px`
- `prefers-reduced-motion: reduce` disables animations for accessibility.

## Design system summary

| Token | CSS var (static) | Tailwind (Next.js) | Value |
|-------|------------------|--------------------|-------|
| Accent | `--orange` | `orange` | `#2E6BFF` |
| Deep | `--orange-deep` | `orangeDeep` | `#1D4ED8` |
| Soft | `--orange-soft` | `orangeSoft` | `#E5EDFF` |
| Cream | `--cream` | `cream` | `#F4F7FC` |
| Charcoal | `--charcoal` | `charcoal` | `#161616` |
| Ink soft | `--ink-soft` | `inkSoft` | `#6B7280` |
| Navy | `--navy` | `navy` | `#0B1F3A` |
| Navy deep | `--navy-deep` | `navyDeep` | `#08172B` |
| Green | `--green` | `green` | `#0B1F3A` |
| White | `--white` | `white` | `#FFFFFF` |

### Fonts

- **Display:** Bricolage Grotesque
- **Body:** Inter

Loaded via Google Fonts in static pages and via `next/font/google` in the Next.js app.
