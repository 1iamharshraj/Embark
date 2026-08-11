# Embark 2.0.0 — UI Animation & 2D Standards

> Standards for motion and 2D animated elements across all new pages. Existing pages keep their current behavior unless explicitly refreshed.

## 1. Goal

- Make the platform feel alive, modern, and premium without distracting from career content.
- Keep animations performant and accessible.
- Reuse animation primitives so new pages look consistent with the existing design system.
- Support 2D animated illustrations, micro-interactions, page transitions, and scroll-driven effects.

## 2. Principles

- **Purpose first.** Every animation should guide attention, provide feedback, or create delight. Avoid motion for decoration alone.
- **Respect reduced motion.** Honor `prefers-reduced-motion` system setting.
- **60fps target.** Animate only `transform` and `opacity` where possible.
- **Brand consistency.** Use the existing blue accent (`#2E6BFF`), navy, and cream palette for all animated assets.
- **Mobile first.** Heavy animations degrade gracefully on low-end devices.
- **No layout shift.** Animated elements must not cause CLS.

## 3. Tech stack

| Use case | Tool |
|----------|------|
| Page transitions, layout animations, gestures | **Framer Motion** |
| Complex sequences, scroll-linked timelines | **GSAP + ScrollTrigger** |
| Vector icon/illustration micro-animations | **Lottie** or **Rive** |
| Simple hover/focus states | **Tailwind CSS transitions** |
| Loading/skeleton states | **Tailwind animate + Framer Motion** |

Choose the simplest tool that does the job. Prefer Framer Motion for React components; reach for GSAP only for scroll-heavy marketing sections.

## 4. Animation tokens

Use these durations and easings across the app:

```ts
export const motion = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    cinematic: 0.8,
  },
  ease: {
    default: [0.4, 0, 0.2, 1],    // ease-out
    bounce: [0.34, 1.56, 0.64, 1],
    smooth: [0.22, 1, 0.36, 1],
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
};
```

## 5. Reusable animation components

Create these in `web/components/motion/`:

### FadeIn

```tsx
// Fades in children when they enter viewport
<FadeIn direction="up" delay={0.1} duration={0.5}>
  <Section />
</FadeIn>
```

### StaggerContainer

```tsx
// Animates a list of children with stagger
<StaggerContainer stagger={0.1}>
  {items.map(i => <Card key={i.id} />)}
</StaggerContainer>
```

### AnimatedCounter

```tsx
// Counts up a number
<AnimatedCounter value={500} suffix="+" duration={1.5} />
```

### HoverScale

```tsx
// Subtle scale on hover
<HoverScale scale={1.02}>{card}</HoverScale>
```

### SkeletonPulse

```tsx
// Loading placeholder
<SkeletonPulse className="h-48 w-full rounded-xl" />
```

### PageTransition

```tsx
// Wrap route content for subtle page fade
<PageTransition>{children}</PageTransition>
```

## 6. Page-specific animation patterns

### Marketing pages

- **Hero:** text reveals staggered left-to-right, hero illustration floats gently (`y: [-8, 8]` loop).
- **Stats band:** counters animate up on scroll.
- **Feature cards:** staggered fade-up on scroll.
- **CTA sections:** subtle background gradient shift or pulse.

### Expert discovery

- **Filter sidebar:** slide-in on mobile, fade on desktop.
- **Expert cards:** staggered grid reveal; hover lifts card and shadows.
- **Search input:** subtle focus ring expansion.

### Expert profile

- **Hero:** cover image parallax, profile photo scale-in.
- **Service tabs:** sliding underline indicator.
- **Availability calendar:** fade transition between weeks.
- **Review cards:** staggered reveal.

### Booking flow

- **Step indicator:** progress bar animates width, checkmarks pop.
- **Slot selection:** selected slot scales and changes color.
- **Success state:** confetti-lite (small SVG burst) or checkmark draw animation.

### Hackathon pages

- **Poster/banner:** subtle Ken Burns or floating effect.
- **Timeline:** progress line draws as user scrolls.
- **Team cards:** staggered entrance.
- **Submission status:** pulsing indicator for pending, checkmark for complete.
- **Results page:** trophy/award icons bounce in; rank numbers count up.

### Admin dashboard

- **Charts:** bars grow from bottom on load.
- **Tables:** row fade-in on pagination change.
- **Status badges:** color pulse for pending items.
- **Toast notifications:** slide in from top-right, auto-dismiss with shrinking timer bar.

## 7. 2D animated assets

Use 2D animation for:

- Empty states (no bookings, no hackathons)
- Success / error illustrations
- Onboarding steps
- Hero illustrations on new marketing pages
- Loading states

### Asset formats

| Format | Best for | Size |
|--------|----------|------|
| **Lottie JSON** | Complex vector animations, empty states | Keep under 50KB |
| **Rive** | Interactive game-like animations, lightweight | Preferred for new work |
| **SVG SMIL/CSS** | Simple loops (floating, pulsing) | Smallest |
| **Animated PNG/WebP** | Detailed raster motion | Use sparingly |

### Guidelines

- Host Lottie/Rive files in `public/animations/`.
- Lazy load animation players; do not block initial render.
- Provide a static fallback image for each animation.
- Limit simultaneous playing animations to 3 per viewport.

## 8. Accessibility

- Wrap motion in `useReducedMotion()`:

```tsx
const shouldReduceMotion = useReducedMotion();
// If true, skip animations or use instant transitions
```

- Never auto-play video-like animations for more than 5 seconds without pause control.
- Ensure focus indicators remain visible during transitions.
- Avoid parallax for users who prefer reduced motion.

## 9. Performance rules

- Animate only `transform` and `opacity`.
- Use `will-change` sparingly and remove after animation.
- Lazy load animation libraries with dynamic imports:

```tsx
const LottiePlayer = dynamic(() => import('lottie-react'), { ssr: false });
```

- Debounce scroll listeners.
- Use CSS transitions for hover/focus; reserve JS animation for complex sequences.
- Test on a low-end Android device in Chrome DevTools performance mode.

## 10. Implementation checklist for new pages

- [ ] Add `FadeIn` or `StaggerContainer` for scroll reveals.
- [ ] Add hover/focus micro-interactions to interactive elements.
- [ ] Add loading skeletons for async sections.
- [ ] Add success/error animated states where applicable.
- [ ] Verify `prefers-reduced-motion` disables non-essential motion.
- [ ] Verify no CLS caused by animations.
- [ ] Run Lighthouse performance audit; animation-related frame drops flagged.

## 11. Example: hero section with motion

```tsx
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-4 py-24"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold uppercase tracking-wider text-blue"
        >
          The platform
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-4 text-4xl font-bold text-charcoal md:text-6xl"
        >
          Your MBA journey needs more than advice.
        </motion.h1>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mt-12"
        >
          {/* Hero illustration */}
        </motion.div>
      </motion.div>
    </section>
  );
}
```

## 12. File locations

- `web/components/motion/` — reusable animation wrappers.
- `web/hooks/use-reduced-motion.ts` — reduced motion hook.
- `public/animations/` — Lottie/Rive/SVG animation assets.
- `web/lib/motion.ts` — shared animation tokens and variants.
