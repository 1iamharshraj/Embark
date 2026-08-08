# Hero section selection

## Chosen hero

**Slide 1** from the previous homepage carousel is the hero section to use everywhere.

### Copy

| Element | Text |
|---------|------|
| Eyebrow | The platform |
| H1 | Your MBA journey needs more than advice. **It needs a roadmap.** |
| Subhead | Embark India helps tier-2 MBA students move from confusion to clarity — from college selection to case competitions, internships, and final placements. |
| Primary CTA | Start your MBA journey → `/mentorship` |
| Secondary CTA | Explore services → `/services` or scroll to services section |

### Why this slide

- It is the **broadest platform promise** and covers all current and future services (mentorship, competitions, playbooks, jobs, guest lectures).
- It frames the product as a **journey/roadmap**, which is a strong mental model for a PWA that students will return to over two years.
- It avoids over-promising the unfinished mentorship engine (Slide 2) or the unbuilt jobs/opportunities board (Slide 4).
- It is less feature-specific than Slide 3 (proof-building), so it will stay relevant as the product evolves.

## Visual adaptation

The current slide uses an animated roadmap SVG with milestone chips. In the Next.js app:

- Keep the **blue blob** (`#2E6BFF`) as a decorative background element.
- Replace the carousel with a **single, static hero section** that uses the same copy and two CTAs.
- Rebuild the roadmap visual as a lightweight React/SVG component with the same milestone chips:
  - College selection
  - Start strong
  - Win summers
  - Win competitions
  - Land offers
- Use the same **Bricolage Grotesque** heading font and **Inter** body font.
- Keep the same spacing, `eyebrow` style, and button styles (`btn-primary`, `btn-ghost`).
- On mobile, stack the copy above the roadmap illustration and simplify the SVG to a vertical timeline.

## Design lock

- **Hero background:** `var(--cream)` (`#F4F7FC`).
- **Accent colour:** `#2E6BFF`.
- **Heading colour:** near-black `#161616`.
- **No carousel autoplay.** The new hero is a single section so the page loads faster and the message is clearer.
- **Same nav + top strip.** The top utility strip and sticky pill nav from the current site are reused above the hero.

## What to drop

- The other three carousel slides are **not** carried forward as a rotating carousel. Their content can be reused lower down the page (e.g. proof-building cards, mentor dashboard, opportunities section) if needed later, but the hero itself is a single message.
- Any hero-band or iframe hero experiments are permanently discarded.
