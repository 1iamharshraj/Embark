import Container from "@/components/Container";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-24 lg:py-32">
      <svg
        className="absolute -top-24 -right-24 w-80 opacity-90 pointer-events-none"
        viewBox="0 0 330 300"
        aria-hidden="true"
      >
        <path
          fill="#2E6BFF"
          d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z"
        />
      </svg>

      <Container>
        <div className="relative z-10 max-w-2xl">
          <Eyebrow>The platform</Eyebrow>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-charcoal">
            Your MBA journey needs more than advice.
            <br />
            <span className="text-orange">It needs a roadmap.</span>
          </h1>
          <p className="mt-6 text-lg text-inkSoft max-w-lg">
            Embark India helps tier-2 MBA students move from confusion to clarity
            — from college selection to case competitions, internships, and final
            placements.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/mentorship">Start your MBA journey</Button>
            <Button href="/competitions" variant="ghost">
              Explore services
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
