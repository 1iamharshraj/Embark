# Playbooks

This document describes the Next.js implementation of the `/playbooks` landing page and `/playbook/[slug]` detail pages, which were rebuilt to match the static `playbooks.html` / `playbook.html` reference files while preserving the existing Prisma-backed data flow.

## Routes

| Route | File | Purpose |
|-------|------|---------|
| `/playbooks` | `web/app/playbooks/page.tsx` | Server component that fetches stream and shop playbooks, renders `PlaybooksPageClient`. |
| `/playbook/[slug]` | `web/app/playbook/[slug]/page.tsx` | Server component that fetches a single playbook, merges static fallback content, and renders `PlaybookDetailClient`. |

## Data sources

### Prisma `Playbook` model
The source of truth remains the existing `Playbook` model in `prisma/schema.prisma`:

```prisma
model Playbook {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  theme       String
  category    String   // "stream", "interview", or "case"
  tagline     String
  oneLiner    String
  content     Json     // structured content for stream playbooks
  price       Int      @default(499)
  rating      Float    @default(4.6)
  meta        String
  order       Int      @default(0)
  ...
}
```

The `content` JSON shape is defined in `web/lib/playbookContent.ts`:

```ts
interface PlaybookContent {
  tagline: string;
  oneLiner: string;
  forYouIf: string[];
  study: string[];
  roles: { role: string; desc: string; arc: string }[];
  recruiters: string[];
  skills: string[];
  plan: { phase: string; detail: string }[];
  signals: { do: string[]; dont: string[] };
  colleges: string[];
}
```

### Static fallback data
Two hard-coded data files supplement DB records and drive the static-page visuals:

- `web/lib/playbookStaticData.ts`
  - `STREAM_PLAYBOOKS` — full content for the six stream playbooks from `js/playbooks.js`.
  - `SHELF_BOOKS` — visual metadata for the 3D shelf (including `Consulting` and `Product` as coming soon).
  - `getStaticPlaybook(slug)` helper.

- `web/lib/shopPlaybooksStatic.ts`
  - `SHOP_PLAYBOOKS` — 15 interview/case prep playbooks copied from `playbooks.html`.
  - `SHOP_COVERS` — gradient covers used in the shop grid.

These files are only used for rendering/fallback. Purchases, progress, and order verification still use the database.

## `/playbooks` landing page sections

Sections render in this order inside `PlaybooksPageClient`:

1. **`PlaybookShelf`** — 3D perspective bookshelf with the eight stream books, hover lift animations, ground shadow, and stream pill links.
2. **`DomainMarquee`** — infinite scrolling pills for the 12 MBA domains.
3. **`PlaybookCategories`** — dark section with fanned card stack; expands to a 5-card grid.
4. **`ShopGrid`** — filterable/sortable shop grid with a buy modal. Integrates the real `RazorpayButton` for checkout; a demo button is also available.
5. **`WhyStudentsNeed`** — pain-point cards + side panel.
6. **`WhyEmbarkPlaybooks`** — 6 feature items with dashed connectors.
7. **`TestimonialCarousel`** — 5 testimonials with prev/next, dots, auto-scroll, and reduced-motion support.

## `/playbook/[slug]` detail page sections

`PlaybookDetailClient` manages access/purchase state and delegates rendering:

- **`PlaybookHero`** — theme-aware hero (`pbt-orange`, `pbt-dark`, `pbt-green`) with large ghost initials, eyebrow, name, and one-liner.
- **`PlaybookContent`** — sticky chapter bar and the full content sections:
  - Is this you?
  - What you'll study
  - Roles
  - Recruiters
  - 2-year gameplan
  - Skill checklist (with progress bar and persistence)
  - Do / Don't
  - Colleges
  - Final "A map is not a mentor" CTA card

## Access, purchase, and progress

### Free stream playbooks
Stream playbooks (`category === "stream"`) are free by default. `PlaybookDetailClient` sets `hasAccess = true` immediately and renders the full `PlaybookContent`.

### Paid shop playbooks
Interview/case playbooks (`category === "interview"` or `"case"`) with `price > 0` are gated. If the user has not purchased, a preview section with the first three `forYouIf` bullets and a Razorpay buy button is shown. After successful payment, the full content is unlocked.

Access is checked via `GET /api/playbooks/[slug]/access`. Admins bypass the gate.

### Progress persistence
The skill checklist progress is persisted:

- **Authenticated users** — `GET /api/playbooks/[slug]/progress` and `POST /api/playbooks/[slug]/progress`.
- **Anonymous users** — `localStorage` key `embark-pb-<slug>`.

## Fonts and styling

- `Gloock`, `Anton`, and `PT Serif` are loaded via `next/font/google` in `web/app/layout.tsx`.
- All playbook-specific CSS lives in `web/app/globals.css` under the clearly marked block `/* ===== Playbooks pages (ported from static site) ===== */`.
- Tailwind is used for outer layout (`max-w-6xl`, `px-6`, etc.) while custom CSS handles gradients, 3D transforms, animations, and static-page fidelity.
- Reduced-motion fallbacks are included for the bookshelf, marquee, category stack/grid, and testimonial carousel.

## Component inventory

| Component | Path | Responsibility |
|-----------|------|----------------|
| `PlaybooksPageClient` | `components/PlaybooksPageClient.tsx` | Composes landing sections; fetches shop access map. |
| `PlaybookShelf` | `components/PlaybookShelf.tsx` | 3D bookshelf hero. |
| `DomainMarquee` | `components/DomainMarquee.tsx` | Infinite domain marquee. |
| `PlaybookCategories` | `components/PlaybookCategories.tsx` | Fanned stack + expanded category grid. |
| `ShopGrid` | `components/ShopGrid.tsx` | Shop filters, sort, grid, and buy modal. |
| `WhyStudentsNeed` | `components/WhyStudentsNeed.tsx` | Pain-point section. |
| `WhyEmbarkPlaybooks` | `components/WhyEmbarkPlaybooks.tsx` | Feature grid. |
| `TestimonialCarousel` | `components/TestimonialCarousel.tsx` | Testimonial slider. |
| `PlaybookDetailClient` | `components/PlaybookDetailClient.tsx` | Access/purchase orchestration. |
| `PlaybookHero` | `components/PlaybookHero.tsx` | Detail page hero. |
| `PlaybookContent` | `components/PlaybookContent.tsx` | Detail page body + checklist persistence. |

## Verification

Run the standard project verification steps:

```bash
cd web && npm run build
```

```bash
cd C:/Users/Kavikkannan/Desktop/Hapkonic/Embark && docker compose up -d --build web
```

```bash
curl -s http://localhost:3000/playbooks
curl -s http://localhost:3000/playbook/marketing
```

Expected key phrases:
- `/playbooks`: "Playbooks", "One book per MBA stream", "Explore all playbooks", "Why Students Need", "Why Embark India Playbooks".
- `/playbook/marketing`: "This playbook is for you if" and "Skill checklist".

## Migration notes

No Prisma schema or seed changes are required. The static data files are additive. Existing `Playbook` records continue to drive access control, purchases, and progress persistence.
