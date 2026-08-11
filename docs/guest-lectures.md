# Guest Lectures Page

The `/guest-lectures` route in the Next.js app mirrors the legacy static `guest-lectures.html`. It is a marketing-style landing page that explains Embark India's guest-lecture service to both **institutes** (who need speakers) and **professionals** (who want to speak).

- **Route:** `web/app/guest-lectures/page.tsx`
- **Page type:** Static (prerendered at build time)
- **Metadata title:** `Guest Lectures — Embark India`
- **Live Docker path:** `http://localhost:3000/guest-lectures`

---

## Page sections (top to bottom)

| # | Section | Purpose | Component |
|---|---------|---------|-----------|
| 1 | Hero | Two-door choice: invite an expert or become one; animated people wall shows breadth. | `GuestLecturesHero` |
| 2 | Logo marquee | Social proof: campuses and companies the speakers come from. | `LogoMarquee` |
| 3 | Outcome flip cards | Three flippable cards for Enrolment, Engagement, Employability. | `FlipCards` |
| 4 | Expertise tabs | Ways to engage (bento grid) + Areas of expertise (bubble cloud). | `ExpertiseTabs` |
| 5 | How it works | Three tilted step cards for the matching flow. | `HowItWorks` |
| 6 | Commitments | Four numbered promises to institutes and speakers. | inline in page |
| 7 | Speaker spotlight | Carousel of example speakers. | `SpeakerCarousel` |
| 8 | FAQ | Six questions with a sticky CTA card. | `FAQ` |
| 9 | Final CTA | Two buttons: invite an expert / become a speaker. | inline in page |

---

## Components

### `GuestLecturesHero.tsx`

- Left copy with eyebrow, headline, subhead, and two CTA buttons.
- Right visual is a 3×2 animated "people wall" of circular avatar tiles that float on hover.
- Two large "door" cards sit below the hero, offering the two core entry points:
  - **Institutes:** "Invite an industry expert"
  - **Professionals:** "Become a guest speaker"
- Decorative SVG blobs in brand blue (`#2E6BFF`).
- Uses a scribble underline SVG for the headline accent.

### `LogoMarquee.tsx`

- Infinite horizontal scroll of logo tiles.
- Tiles alternate between real logo images (`/assets/logos/*.png`) and monochrome campus badges (`IIM A`, `IIM B`, `IIM C`).
- Uses CSS `animation: logoslide 28s linear infinite`.
- Gracefully hides missing images via `onError`.

### `FlipCards.tsx`

- Three cards that flip on hover or focus.
- Front: number, title, short description.
- Back: bullet list of tangible outcomes.
- Uses `transform-style: preserve-3d`, `rotateY(180deg)`, and `backface-visibility: hidden`.

### `ExpertiseTabs.tsx`

- **Ways to engage:** bento grid of five format cards (Guest lecture, Workshop, Panel discussion, Curriculum partnership, Mock interview + feedback).
- **Areas of expertise:** desktop shows an animated bubble cloud; mobile falls back to a chip list.
- Bubble cloud uses CSS absolute positioning; chips are a flex wrap.

### `HowItWorks.tsx`

- Three numbered step cards, slightly rotated for visual rhythm.
- Steps: "Tell us what you need", "We shortlist speakers", "You confirm and host".
- Each card has an icon, title, and one-line description.

### `SpeakerCarousel.tsx`

- Client-only carousel of speaker spotlights.
- Includes photo, name, role, company, and short quote.
- Previous/next buttons and auto-rotation via `setInterval`.
- Respects `prefers-reduced-motion`.

---

## Shared components used

- `Container` — consistent max-width wrapper.
- `Button` — primary / light variants.
- `FAQ` — collapsible accordion used on multiple pages.

---

## Styling

Guest-lectures styles are in `web/app/globals.css` under the section comment `/* Guest Lectures page styles */`.

Key custom CSS includes:

| Class / selector | What it does |
|------------------|--------------|
| `.people-wall` | Grid of animated avatar tiles. |
| `.gl-door` | Large two-column entry cards with hover lift. |
| `.marquee-track` | Infinite scrolling logo strip. |
| `.logo-tile`, `.logo-mono` | Individual tile styling and campus badge. |
| `.flip-card` | 3D flip container. |
| `.flip-card-inner` | Rotates 180° on hover/focus. |
| `.bento-card` | Rounded format cards in the expertise grid. |
| `.bubble-cloud` / `.chip-list` | Desktop bubbles vs mobile chips. |
| `.hiw-card` | Tilted step cards. |
| `.spot-carousel` | Speaker carousel shell. |

---

## Data sources

All page data is hard-coded in the components and `page.tsx`:

- Logos list in `LogoMarquee.tsx`
- Flip-card copy in `FlipCards.tsx`
- Engagement formats and expertise bubbles in `ExpertiseTabs.tsx`
- How-it-works steps in `HowItWorks.tsx`
- Speaker profiles in `SpeakerCarousel.tsx`
- FAQ items and commitments in `page.tsx`

None of this content currently comes from the database; it can be migrated to CMS/DB later without changing the component shape.

---

## Accessibility notes

- All interactive flip cards are focusable and flip on `:focus-within`.
- Carousel has previous/next buttons with `aria-label` and keyboard support.
- FAQ uses the shared `FAQ` accordion with button-controlled panels.
- Marquee is decorative and does not auto-advance in a way that blocks content.
- Reduced-motion users get instant state changes instead of animations.

---

## Mapping to legacy static page

| Static `guest-lectures.html` | Next.js equivalent |
|------------------------------|--------------------|
| Hero with people wall and two doors | `GuestLecturesHero` |
| "Studied at the best. Working at the best." logo strip | `LogoMarquee` |
| Enrolment / Engagement / Employability flip cards | `FlipCards` |
| "Ways to engage" bento + expertise bubbles | `ExpertiseTabs` |
| "How it works" three cards | `HowItWorks` |
| "Our commitments" four cards | inline section in `page.tsx` |
| Speaker spotlight slider | `SpeakerCarousel` |
| FAQ + final CTA | `FAQ` + inline CTA section |

---

## Build and deploy verification

1. Local build:
   ```bash
   cd web
   npm run build
   ```
2. Docker:
   ```bash
   docker compose up -d --build web
   ```
3. Verify page:
   ```bash
   curl -s http://localhost:3000/guest-lectures | grep -oE "(Studied at the best|Frequently asked questions|Industry belongs in the timetable)"
   ```

The page is prerendered as static HTML at build time, so no database is required for it to load.
