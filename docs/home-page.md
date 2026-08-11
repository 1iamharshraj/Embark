# Home Page — Next.js Implementation

The Next.js home page (`web/app/page.tsx`) is designed to mirror the richer UI/UX of the legacy static `index.html` while using the dynamic Prisma backend for live competition data.

## Goals

- Match the visual hierarchy and motion of `index.html`.
- Keep the page server-rendered and dynamic (`export const dynamic = "force-dynamic"`).
- Use static marketing content for sections that do not need database changes.
- Pull live competition data from the existing `Competition` model.

## Sections (top to bottom)

| # | Section | Source | Component |
|---|---------|--------|-----------|
| 1 | TopBar | `components/TopBar.tsx` | global layout |
| 2 | Navigation | `components/Nav.tsx` | global layout |
| 3 | Hero carousel | static copy + SVG visuals | `components/HeroCarousel.tsx` |
| 4 | Poster marquee | static poster images | `components/PosterMarquee.tsx` |
| 5 | Live competitions | Prisma `Competition` table | `components/LiveCompetitions.tsx` |
| 6 | Partner logos marquee | static logo assets | `components/PartnersMarquee.tsx` |
| 7 | MBA reality grid | static stats & messages | inline in `page.tsx` |
| 8 | College spotlight marquee | static college cards | `components/CollegesMarquee.tsx` |
| 9 | Embark impact band | static stats | inline in `page.tsx` |
| 10 | Service strip | 9 service cards | `components/ServiceStrip.tsx` |
| 11 | Final CTA | static copy | inline in `page.tsx` |
| 12 | Footer | `components/Footer.tsx` | global layout |

## Hero carousel

`web/components/HeroCarousel.tsx` is a client component that rotates through four slides every 8 seconds.

Slides:
1. **The platform** — roadmap illustration from CAT score → final placement.
2. **Mentorship** — mentor dashboard checklist (college selection, resume, internship, competitions, placement).
3. **Proof-building** — competition → deck → certificate → LinkedIn share.
4. **Opportunities** — live opportunity feed (internships, roles, guest lectures, mock interviews).

Visual fidelity to the static site:
- Hero blobs are positioned per slide with the same low opacity (0.16) as `index.html`.
- Copy text and CTA buttons stagger-fade in on each slide change.
- Roadmap chips pop in with the same scale/translate easing and delays.
- The dashed roadmap path animates with a marching-ants effect (`ants` keyframe).
- Mentor dashboard items slide in from the right with the same delays.
- Proof cards use the same absolute positions, rotations, and stagger timing.
- Opportunity feed items slide in with colored dot indicators.

Interactions:
- Previous / next buttons
- Dotted indicators
- Touch swipe
- Pause on hover
- Respects `prefers-reduced-motion`
- Visuals render server-side (no `mounted` guard) so the first paint shows content immediately.

## Poster marquee

Static posters copied from `assets/posters/` into `web/public/assets/posters/`:
- `finance.png`
- `quiz.png`
- `marketing.png`

The track duplicates for a seamless CSS translate loop (`postslide` animation, 36 s).

## Live competitions

`components/LiveCompetitions.tsx` receives the competition list from the server page. It filters for competitions where `startAt <= now <= endAt` and renders a card grid. Cards show:
- Banner image (if `banners` array is populated)
- Category + fee + registration close date
- "Enter →" link to `/competition/[id]`

If no competitions are currently live, the section is hidden.

## Partner logos marquee

Logos copied from `assets/logos/` into `web/public/assets/logos/`. The marquee duplicates the list for a seamless loop (`partnerslide` animation, 40 s).

## MBA reality grid

A CSS-grid of cards showing the crowded MBA funnel:
- 2.95L+ CAT registrations
- 1.42L+ XAT registrations
- 1.57L+ MAH CET registrations
- Multiple exam chips (CAT, XAT, SNAP, NMAT, CMAT, MAT, CET)
- Funnel, brand gap, preparation, proof, guidance, and early-planning messages
- Large "The reality" cell with the headline *"Lakhs enter the MBA race. Very few get a clear roadmap."*
- Brand cell linking to `/mentorship`

## College spotlight marquee

Static tier-2/Tier-1 college cards with average and highest package stats:
- IMT Ghaziabad, Great Lakes, XIM University, Welingkar, K J Somaiya, TAPMI, FORE, GIM

Each card has a "View details" CTA to `/playbooks`.

## Embark impact band

Navy background section with four stat cards:
- 1,000+ MBA aspirants reached
- 150+ mentors & industry speakers
- 100+ MBA prep resources
- 1,000+ curated opportunities

## Service strip

`components/ServiceStrip.tsx` is a horizontally scrollable strip of nine pastel-gradient service cards:

| Card | Link |
|------|------|
| Competitions | `/competitions` |
| Mock interviews & GD | (coming soon) |
| Industry Playbooks | `/playbooks` |
| End-to-end mentorship | `/mentorship` |
| Courses | (coming soon) |
| Jobs & Internships | (coming soon) |
| College hub | (coming soon) |
| Quizzes | (coming soon) |
| Workshops | (coming soon) |

Cards without a link are rendered as `<span>`; linked cards are rendered as Next.js `<Link>`. The strip supports scroll-snap, left/right buttons, and a staggered entrance animation.

## Final CTA

Navy rounded card with the headline *"Start before you feel ready."* and two buttons: "Pick your stream" → `/playbooks` and "Talk to us" → `mailto:hello@embarkindia.in`.

## Assets added for the home page

The following static assets were copied from the project root `assets/` folder into `web/public/assets/` so Next.js can serve them from the public directory:

```
web/public/assets/
├── posters/
│   ├── finance.png
│   ├── quiz.png
│   └── marketing.png
├── logos/
│   ├── amazon.png
│   ├── capgemini.png
│   ├── cipla.png
│   ├── cocacola.png
│   ├── hul.png
│   ├── idfcfirst.png
│   ├── itc.png
│   ├── marutisuzuki.png
│   ├── mckinsey.png
│   ├── razorpay.png
│   ├── sunpharma.png
│   ├── swiggy.png
│   ├── tata.png
│   └── ultratech.png
└── people/
    └── p1.jpg … p10.jpg
```

## CSS animations

Added to `web/app/globals.css`:

- `postslide` — poster marquee loop
- `partnerslide` — partner logo loop
- `colslide` — college spotlight loop
- `lcpulse` — live competition dot pulse
- `.pcard` entrance — service cards fade/slide/rotate in
- `.scrollbar-hide` — hide horizontal scrollbar on the service strip

## Database / migration notes

No schema changes were required. The existing `Competition` model already contains `startAt`, `endAt`, `regClose`, `fee`, `category`, `banner`, and `banners`, which the Live Competitions section uses.

The Prisma seed (`web/prisma/seed.ts`) already creates multiple demo competitions, including live, upcoming, and closed ones, so the home page shows realistic data after seeding.

## How to verify

```bash
# Local build
cd web
npm run build

# Local Docker (from project root)
docker compose up -d --build web
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/ | grep -o "HeroCarousel\\|PosterMarquee\\|Live right now"
```

## Files changed

- `web/app/page.tsx` — rewrote homepage layout
- `web/app/globals.css` — added marquee & card entrance animations
- `web/components/HeroCarousel.tsx` — new
- `web/components/PosterMarquee.tsx` — new
- `web/components/LiveCompetitions.tsx` — new
- `web/components/PartnersMarquee.tsx` — new
- `web/components/CollegesMarquee.tsx` — new
- `web/components/ServiceStrip.tsx` — new
- `web/public/assets/` — copied marketing images
