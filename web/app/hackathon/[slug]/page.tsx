import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Button from "@/components/Button";
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/motion";
import { hackathonStatus, displayStatus, statusBadgeClass, registrationOpen, submissionOpen } from "@/lib/hackathon";
import Timeline from "../_components/Timeline";

export const dynamic = "force-dynamic";

export default async function HackathonDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);

  const hackathon = await prisma.hackathon.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
    include: {
      timelines: { orderBy: { startsAt: "asc" } },
      _count: { select: { registrations: true, teams: true } },
    },
  });

  if (!hackathon || hackathon.status === "DRAFT") {
    notFound();
  }

  const status = hackathonStatus(hackathon);
  const rules = (hackathon.rules as { rules?: string[] })?.rules || [];
  const faqs = (hackathon.faqs as { faqs?: { question: string; answer: string }[] })?.faqs || [];
  const eligibility = hackathon.eligibility as { text?: string; criteria?: string[] } | undefined;
  const problem = hackathon.problemStatement as { title?: string; description?: string } | undefined;
  const resources = hackathon.resources as { prizes?: [string, string][]; submissionGuidelines?: string[] } | undefined;
  const settings = hackathon.settings as Record<string, unknown> | undefined;

  let userRegistration = null;
  if (session?.user?.id) {
    userRegistration = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId: session.user.id } },
    });
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up" className="mb-6">
            <Link href="/hackathons" className="text-sm font-semibold text-orangeDeep hover:underline inline-block">
              ← All hackathons
            </Link>
          </FadeIn>

          <FadeIn direction="up" delay={0.05}>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-10 mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-cream text-charcoal border border-charcoal/8">
                  {hackathon.category}
                </span>
                <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${statusBadgeClass(status)}`}>
                  {displayStatus(hackathon)}
                </span>
              </div>

              <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-3">{hackathon.title}</h1>
              <p className="text-inkSoft text-lg mb-6">{hackathon.subtitle}</p>

              <div className="flex flex-wrap gap-4 text-sm text-inkSoft mb-8">
                <span>Organizer: <strong className="text-charcoal">{hackathon.organizer}</strong></span>
                <span>Mode: <strong className="text-charcoal">{hackathon.participationMode}</strong></span>
                <span>Team size: <strong className="text-charcoal">{hackathon.teamMin}-{hackathon.teamMax}</strong></span>
                <span>Fee: <strong className="text-charcoal">{hackathon.fee > 0 ? `₹${hackathon.fee}` : "Free"}</strong></span>
                <span>
                  Registered:{" "}
                  <strong className="text-charcoal">
                    <AnimatedCounter value={hackathon._count.registrations} />
                  </strong>
                </span>
              </div>

              {registrationOpen(hackathon) && !userRegistration && (
                <Button href={`/hackathon/${hackathon.slug}/register`}>Register now</Button>
              )}
              {userRegistration && (
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
                  Registered
                  {submissionOpen(hackathon) && (
                    <Link href={`/hackathon/${hackathon.slug}/submit`} className="underline ml-1">
                      Submit →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-[1fr_0.38fr] gap-8">
            <StaggerContainer className="space-y-8" staggerDelay={0.1}>
              {hackathon.shortDescription && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">About</h2>
                    <p className="text-inkSoft whitespace-pre-line">{hackathon.shortDescription}</p>
                    {hackathon.detailedDescription && (
                      <p className="text-inkSoft whitespace-pre-line mt-4">{hackathon.detailedDescription}</p>
                    )}
                  </div>
                </StaggerItem>
              )}

              {problem && (problem.title || problem.description) && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Problem statement</h2>
                    {problem.title && <h3 className="font-semibold text-charcoal mb-2">{problem.title}</h3>}
                    {problem.description && <p className="text-inkSoft whitespace-pre-line">{problem.description}</p>}
                  </div>
                </StaggerItem>
              )}

              {rules.length > 0 && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-inkSoft">
                      {rules.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              )}

              {eligibility && (eligibility.text || (eligibility.criteria && eligibility.criteria.length > 0)) && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Eligibility</h2>
                    {eligibility.text && <p className="text-inkSoft whitespace-pre-line mb-3">{eligibility.text}</p>}
                    {eligibility.criteria && eligibility.criteria.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-inkSoft">
                        {eligibility.criteria.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </StaggerItem>
              )}

              {resources?.prizes && resources.prizes.length > 0 && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Prizes</h2>
                    <ul className="space-y-2">
                      {resources.prizes.map((p, i) => (
                        <li key={i} className="text-inkSoft">
                          <strong className="text-charcoal">{p[0]}</strong> — {p[1]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              )}

              {faqs.length > 0 && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">FAQs</h2>
                    <div className="space-y-4">
                      {faqs.map((f, i) => (
                        <div key={i}>
                          <p className="font-semibold text-charcoal">{f.question}</p>
                          <p className="text-inkSoft text-sm">{f.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              )}
            </StaggerContainer>

            <div className="space-y-6">
              <FadeIn direction="left" delay={0.2}>
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <h2 className="font-display font-bold text-lg text-charcoal mb-4">Timeline</h2>
                  <Timeline events={hackathon.timelines} />
                </div>
              </FadeIn>

              {settings && ((settings.ppo as boolean) || (settings.beginner as boolean)) && (
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <h2 className="font-display font-bold text-lg text-charcoal mb-3">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {(settings.ppo as boolean) && (
                      <span className="text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-700 rounded-full px-3 py-1">
                        PPO opportunity
                      </span>
                    )}
                    {(settings.beginner as boolean) && (
                      <span className="text-xs font-semibold uppercase tracking-wider bg-cream text-charcoal border border-charcoal/8 rounded-full px-3 py-1">
                        Beginner friendly
                      </span>
                    )}
                  </div>
                </div>
              )}

              {registrationOpen(hackathon) && !userRegistration && (
                <Button href={`/hackathon/${hackathon.slug}/register`} className="w-full justify-center">
                  Register now
                </Button>
              )}
              {submissionOpen(hackathon) && userRegistration && (
                <Button href={`/hackathon/${hackathon.slug}/submit`} className="w-full justify-center">
                  Submit solution
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
