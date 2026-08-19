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

const PUBLISHED_STATUSES = ["RESULTS_PUBLISHED", "CERTIFICATES_ISSUED", "CLOSED"];

type RulesShape = {
  eligibility?: string[];
  registration?: string[];
  teamRules?: string[];
  submissionRules?: string[];
  plagiarism?: string[];
  aiUsage?: string[];
  evaluationCriteria?: string[];
  disqualification?: string[];
  ip?: string[];
  rules?: string[];
};

type EligibilityShape = {
  userTypes?: string[];
  colleges?: string[];
  courses?: string[];
  years?: number[];
  geography?: string[];
  mode?: string;
  teamMin?: number;
  teamMax?: number;
  criteria?: string[];
  text?: string;
};

type ProblemResource = { title: string; url?: string; description?: string };
type ProblemFaq = { question: string; answer: string };

type ProblemStatementShape = {
  title?: string;
  description?: string;
  background?: string;
  businessProblem?: string;
  challenge?: string;
  objective?: string;
  expectedOutput?: string;
  constraints?: string[];
  resources?: ProblemResource[];
  faqs?: ProblemFaq[];
};

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function RuleSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
      <ul className="list-disc pl-5 space-y-1.5 text-inkSoft">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="text-sm text-inkSoft">
      {label}: <strong className="text-charcoal">{value}</strong>
    </span>
  );
}

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
  const rules = (hackathon.rules as RulesShape) ?? {};
  const legacyRules = asStringArray(rules.rules);
  const eligibility = (hackathon.eligibility as EligibilityShape) ?? {};
  const problem = (hackathon.problemStatement as ProblemStatementShape) ?? {};
  const resources = (hackathon.resources as { prizes?: [string, string][]; submissionGuidelines?: string[] } | undefined) ?? {};
  const settings = hackathon.settings as Record<string, unknown> | undefined;
  const legacyFaqs = (hackathon.faqs as { faqs?: ProblemFaq[] } | undefined)?.faqs ?? [];

  const problemFaqs = problem.faqs && problem.faqs.length > 0 ? problem.faqs : legacyFaqs;

  let userRegistration = null;
  if (session?.user?.id) {
    userRegistration = await prisma.hackathonRegistration.findUnique({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId: session.user.id } },
    });
  }

  const registrationIsOpen = registrationOpen(hackathon);
  const submissionIsOpen = submissionOpen(hackathon);

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

              <div className="flex flex-wrap gap-4 mb-8">
                <MetaPill label="Organizer" value={hackathon.organizer} />
                <MetaPill label="Mode" value={hackathon.participationMode} />
                <MetaPill label="Team size" value={`${hackathon.teamMin}-${hackathon.teamMax}`} />
                <MetaPill label="Fee" value={hackathon.fee > 0 ? `₹${hackathon.fee}` : "Free"} />
                <MetaPill
                  label="Registered"
                  value={<AnimatedCounter value={hackathon._count.registrations} />}
                />
              </div>

              {registrationIsOpen && !userRegistration && (
                <Button href={`/hackathon/${hackathon.slug}/register`}>Register now</Button>
              )}
              {userRegistration && (
                <div className="inline-flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
                    Registered
                    {submissionIsOpen && (
                      <Link href={`/hackathon/${hackathon.slug}/submit`} className="underline ml-1">
                        Submit →
                      </Link>
                    )}
                  </div>
                  {hackathon.participationMode === "TEAM" && (
                    <Link
                      href={`/hackathon/${hackathon.slug}/team`}
                      className="text-sm font-semibold text-orangeDeep hover:underline"
                    >
                      My team →
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

              {(problem.title ||
                problem.description ||
                problem.background ||
                problem.businessProblem ||
                problem.challenge ||
                problem.objective ||
                problem.expectedOutput) && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-4">Problem statement</h2>
                    {problem.title && <h3 className="font-semibold text-charcoal mb-2">{problem.title}</h3>}
                    {problem.description && <p className="text-inkSoft whitespace-pre-line mb-5">{problem.description}</p>}
                    {problem.background && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-charcoal mb-1">Background</h3>
                        <p className="text-inkSoft whitespace-pre-line">{problem.background}</p>
                      </div>
                    )}
                    {problem.businessProblem && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-charcoal mb-1">Business problem</h3>
                        <p className="text-inkSoft whitespace-pre-line">{problem.businessProblem}</p>
                      </div>
                    )}
                    {problem.challenge && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-charcoal mb-1">Challenge</h3>
                        <p className="text-inkSoft whitespace-pre-line">{problem.challenge}</p>
                      </div>
                    )}
                    {problem.objective && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-charcoal mb-1">Objective</h3>
                        <p className="text-inkSoft whitespace-pre-line">{problem.objective}</p>
                      </div>
                    )}
                    {problem.expectedOutput && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-charcoal mb-1">Expected output</h3>
                        <p className="text-inkSoft whitespace-pre-line">{problem.expectedOutput}</p>
                      </div>
                    )}
                    {problem.constraints && problem.constraints.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-charcoal mb-2">Constraints</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-inkSoft">
                          {problem.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              )}

              {(problem.resources && problem.resources.length > 0) && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Resources</h2>
                    <ul className="space-y-3">
                      {problem.resources.map((r, i) => (
                        <li key={i} className="text-inkSoft">
                          {r.url ? (
                            <Link href={r.url} target="_blank" className="font-semibold text-orangeDeep hover:underline">
                              {r.title || r.url}
                            </Link>
                          ) : (
                            <span className="font-semibold text-charcoal">{r.title}</span>
                          )}
                          {r.description && <p className="text-sm mt-0.5">{r.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              )}

              {(legacyRules.length > 0 ||
                rules.eligibility?.length ||
                rules.registration?.length ||
                rules.teamRules?.length ||
                rules.submissionRules?.length ||
                rules.plagiarism?.length ||
                rules.aiUsage?.length ||
                rules.evaluationCriteria?.length ||
                rules.disqualification?.length ||
                rules.ip?.length) && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-4">Rules</h2>
                    {legacyRules.length > 0 && (
                      <ul className="list-disc pl-5 space-y-2 text-inkSoft mb-5">
                        {legacyRules.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                    <RuleSection title="Eligibility" items={asStringArray(rules.eligibility)} />
                    <RuleSection title="Registration" items={asStringArray(rules.registration)} />
                    <RuleSection title="Team rules" items={asStringArray(rules.teamRules)} />
                    <RuleSection title="Submission rules" items={asStringArray(rules.submissionRules)} />
                    <RuleSection title="Plagiarism" items={asStringArray(rules.plagiarism)} />
                    <RuleSection title="AI usage" items={asStringArray(rules.aiUsage)} />
                    <RuleSection title="Evaluation criteria" items={asStringArray(rules.evaluationCriteria)} />
                    <RuleSection title="Disqualification" items={asStringArray(rules.disqualification)} />
                    <RuleSection title="IP" items={asStringArray(rules.ip)} />
                  </div>
                </StaggerItem>
              )}

              {(eligibility.text ||
                eligibility.criteria?.length ||
                eligibility.userTypes?.length ||
                eligibility.colleges?.length ||
                eligibility.courses?.length ||
                eligibility.years?.length ||
                eligibility.geography?.length) && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-4">Eligibility</h2>
                    {eligibility.text && <p className="text-inkSoft whitespace-pre-line mb-4">{eligibility.text}</p>}
                    <div className="space-y-3 text-inkSoft">
                      {eligibility.userTypes && eligibility.userTypes.length > 0 && (
                        <p>
                          <strong className="text-charcoal">User types:</strong> {eligibility.userTypes.join(", ")}
                        </p>
                      )}
                      {eligibility.colleges && eligibility.colleges.length > 0 && (
                        <p>
                          <strong className="text-charcoal">Colleges:</strong> {eligibility.colleges.join(", ")}
                        </p>
                      )}
                      {eligibility.courses && eligibility.courses.length > 0 && (
                        <p>
                          <strong className="text-charcoal">Courses:</strong> {eligibility.courses.join(", ")}
                        </p>
                      )}
                      {eligibility.years && eligibility.years.length > 0 && (
                        <p>
                          <strong className="text-charcoal">Years:</strong> {eligibility.years.join(", ")}
                        </p>
                      )}
                      {eligibility.geography && eligibility.geography.length > 0 && (
                        <p>
                          <strong className="text-charcoal">Geography:</strong> {eligibility.geography.join(", ")}
                        </p>
                      )}
                      {eligibility.mode && (
                        <p>
                          <strong className="text-charcoal">Participation:</strong> {eligibility.mode.replace(/_/g, " ")}
                        </p>
                      )}
                      {(eligibility.teamMin !== undefined || eligibility.teamMax !== undefined) && (
                        <p>
                          <strong className="text-charcoal">Team size:</strong>{" "}
                          {eligibility.teamMin ?? hackathon.teamMin}-{eligibility.teamMax ?? hackathon.teamMax}
                        </p>
                      )}
                    </div>
                    {eligibility.criteria && eligibility.criteria.length > 0 && (
                      <ul className="list-disc pl-5 mt-4 space-y-1.5 text-inkSoft">
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

              {problemFaqs.length > 0 && (
                <StaggerItem>
                  <div className="bg-white rounded-2xl p-6 sm:p-8">
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">FAQs</h2>
                    <div className="space-y-4">
                      {problemFaqs.map((f, i) => (
                        <div key={i}>
                          <p className="font-semibold text-charcoal">{f.question}</p>
                          <p className="text-inkSoft text-sm whitespace-pre-line">{f.answer}</p>
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

              {registrationIsOpen && !userRegistration && (
                <Button href={`/hackathon/${hackathon.slug}/register`} className="w-full justify-center">
                  Register now
                </Button>
              )}
              {submissionIsOpen && userRegistration && (
                <Button href={`/hackathon/${hackathon.slug}/submit`} className="w-full justify-center">
                  Submit solution
                </Button>
              )}
              {userRegistration && hackathon.participationMode === "TEAM" && (
                <Button href={`/hackathon/${hackathon.slug}/team`} variant="ghost" className="w-full justify-center">
                  My team
                </Button>
              )}
              {PUBLISHED_STATUSES.includes(hackathon.status) && (
                <Button href={`/hackathon/${hackathon.slug}/results`} variant="ghost" className="w-full justify-center">
                  View results
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
