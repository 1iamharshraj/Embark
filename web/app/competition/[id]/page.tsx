import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

function statusFor(now: Date, regOpen: Date, regClose: Date, endAt: Date) {
  if (now < regOpen) return "Upcoming";
  if (now >= regOpen && now <= regClose) return "Live";
  if (now > regClose && now < endAt) return "Running";
  return "Closed";
}

function statusBadge(status: string) {
  switch (status) {
    case "Live":
      return "bg-green-100 text-green-700";
    case "Upcoming":
      return "bg-orangeSoft text-orangeDeep";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
    select: { title: true, about: true },
  });
  return {
    title: competition ? `${competition.title} — Embark India` : "Competition — Embark India",
    description: competition?.about || "MBA case competition on Embark India.",
  };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
  });

  if (!competition) {
    notFound();
  }

  const now = new Date();
  const status = statusFor(now, competition.regOpen, competition.regClose, competition.endAt);

  const rounds = Array.isArray(competition.rounds) ? competition.rounds : [];
  const prizes = competition.prizes ? JSON.stringify(competition.prizes) : null;
  const contacts = competition.contacts ? JSON.stringify(competition.contacts) : null;
  const faqs = Array.isArray(competition.faqs) ? competition.faqs : [];

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 lg:py-24">
        <svg
          className="absolute -top-32 -right-32 w-80 opacity-90 pointer-events-none"
          viewBox="0 0 330 300"
          aria-hidden="true"
        >
          <path
            fill="#2E6BFF"
            d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z"
          />
        </svg>
        <Container>
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-orangeSoft text-orangeDeep rounded-full px-3 py-1">
                {competition.category}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${statusBadge(status)}`}>
                {status}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-charcoal leading-tight mb-5">
              {competition.title}
            </h1>
            <p className="text-lg text-inkSoft mb-6">{competition.about || competition.eligibility}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-inkSoft">
                Fee: <strong className="text-charcoal">{competition.fee > 0 ? `₹${competition.fee}` : "Free"}</strong>
              </span>
              <span className="text-inkSoft">
                Team: <strong className="text-charcoal">{competition.teamMin}–{competition.teamMax}</strong>
              </span>
              {competition.ppo && (
                <span className="text-inkSoft">
                  PPO: <strong className="text-charcoal">Yes</strong>
                </span>
              )}
              {competition.beginner && (
                <span className="text-inkSoft">
                  Beginner-friendly: <strong className="text-charcoal">Yes</strong>
                </span>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid lg:grid-cols-[1fr_0.4fr] gap-12 items-start">
            <div className="space-y-10">
              {competition.eligibility && (
                <div>
                  <Eyebrow>Eligibility</Eyebrow>
                  <p className="text-charcoal leading-relaxed">{competition.eligibility}</p>
                </div>
              )}

              {competition.rules.length > 0 && (
                <div>
                  <Eyebrow>Rules</Eyebrow>
                  <ul className="grid gap-3">
                    {competition.rules.map((rule) => (
                      <li key={rule} className="flex items-start gap-3 text-charcoal">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rounds.length > 0 && (
                <div>
                  <Eyebrow>Rounds</Eyebrow>
                  <div className="grid gap-4">
                    {rounds.map((round, i) => {
                      const r = round as { name?: string; description?: string; deadline?: string };
                      return (
                        <div
                          key={i}
                          className="bg-cream rounded-2xl p-5 border border-charcoal/8"
                        >
                          <span className="text-xs font-bold text-orange tracking-widest">Round {i + 1}</span>
                          <h3 className="font-display font-bold text-lg text-charcoal mt-1 mb-2">
                            {r.name || "Round details"}
                          </h3>
                          {r.description && <p className="text-sm text-inkSoft">{r.description}</p>}
                          {r.deadline && <p className="text-xs text-inkSoft mt-2">Deadline: {r.deadline}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {competition.eligibilityCriteria.length > 0 && (
                <div>
                  <Eyebrow>Eligibility criteria</Eyebrow>
                  <ul className="grid gap-2">
                    {competition.eligibilityCriteria.map((c) => (
                      <li key={c} className="text-sm text-charcoal flex items-start gap-2">
                        <span className="text-orange">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {competition.teamStructure.length > 0 && (
                <div>
                  <Eyebrow>Team structure</Eyebrow>
                  <ul className="grid gap-2">
                    {competition.teamStructure.map((c) => (
                      <li key={c} className="text-sm text-charcoal flex items-start gap-2">
                        <span className="text-orange">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {competition.submissionGuidelines.length > 0 && (
                <div>
                  <Eyebrow>Submission guidelines</Eyebrow>
                  <ul className="grid gap-2">
                    {competition.submissionGuidelines.map((c) => (
                      <li key={c} className="text-sm text-charcoal flex items-start gap-2">
                        <span className="text-orange">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {faqs.length > 0 && (
                <div>
                  <Eyebrow>FAQs</Eyebrow>
                  <div className="grid gap-4">
                    {faqs.map((item, i) => {
                      const f = item as { question?: string; answer?: string };
                      return (
                        <div key={i} className="bg-cream rounded-2xl p-5">
                          <h3 className="font-display font-bold text-base text-charcoal mb-2">
                            {f.question || "Question"}
                          </h3>
                          <p className="text-sm text-inkSoft">{f.answer || "—"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="bg-cream rounded-3xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] lg:sticky lg:top-24">
              <h3 className="font-display font-bold text-lg text-charcoal mb-4">Key dates</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-inkSoft">Registration opens</span>
                  <span className="font-medium text-charcoal">
                    {competition.regOpen.toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inkSoft">Registration closes</span>
                  <span className="font-medium text-charcoal">
                    {competition.regClose.toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inkSoft">Competition starts</span>
                  <span className="font-medium text-charcoal">
                    {competition.startAt.toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inkSoft">Competition ends</span>
                  <span className="font-medium text-charcoal">
                    {competition.endAt.toLocaleDateString("en-IN")}
                  </span>
                </div>
                {competition.resultAt && (
                  <div className="flex justify-between">
                    <span className="text-inkSoft">Results</span>
                    <span className="font-medium text-charcoal">
                      {competition.resultAt.toLocaleDateString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
              {prizes && (
                <div className="mb-6">
                  <h3 className="font-display font-bold text-base text-charcoal mb-2">Prizes</h3>
                  <p className="text-sm text-inkSoft break-words">{prizes}</p>
                </div>
              )}
              {contacts && (
                <div className="mb-6">
                  <h3 className="font-display font-bold text-base text-charcoal mb-2">Contacts</h3>
                  <p className="text-sm text-inkSoft break-words">{contacts}</p>
                </div>
              )}
              <Button href="/auth/signin" className="w-full">
                Sign in to register
              </Button>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
