import { notFound, redirect } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import EvaluationForm from "./_components/EvaluationForm";

interface Criterion {
  name: string;
  weight?: number;
}

function parseCriteria(value: unknown): Criterion[] {
  const obj = value as Record<string, unknown> | null | undefined;
  if (obj && Array.isArray(obj.criteria)) {
    return obj.criteria
      .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
      .map((c) => ({
        name: String(c.name || "Criterion"),
        weight: typeof c.weight === "number" ? c.weight : 1,
      }));
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
      .map((c) => ({
        name: String(c.name || "Criterion"),
        weight: typeof c.weight === "number" ? c.weight : 1,
      }));
  }
  return [{ name: "Overall", weight: 1 }];
}

export default async function JudgeSubmissionDetailPage({
  params,
}: {
  params: { id: string; submissionId: string };
}) {
  const user = await checkPagePermission("hackathon.evaluation.view");

  const [hackathon, submission] = await Promise.all([
    prisma.hackathon.findUnique({ where: { id: params.id } }),
    prisma.hackathonSubmission.findUnique({
      where: { id: params.submissionId },
      include: {
        files: true,
        team: { select: { name: true } },
        hackathon: { select: { id: true } },
      },
    }),
  ]);

  if (!hackathon || !submission || submission.hackathonId !== hackathon.id) {
    notFound();
  }

  const judge = await prisma.judge.findUnique({
    where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
  });

  if (!judge && !user.isAdmin) {
    redirect("/judge/hackathons");
  }

  const existingEvaluation = judge
    ? await prisma.evaluation.findUnique({
        where: {
          submissionId_judgeId: { submissionId: submission.id, judgeId: judge.id },
        },
        include: { scores: true },
      })
    : null;

  const criteria = parseCriteria(hackathon.evaluationCriteria);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Button href={`/judge/hackathons/${hackathon.id}/submissions`} variant="ghost" size="sm">
            ← Back to submissions
          </Button>
          <Eyebrow className="mt-4">Evaluate submission</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{hackathon.title}</h1>
          <p className="text-inkSoft mb-8">Review the submission and enter scores for each criterion.</p>

          <EvaluationForm
            hackathon={{ id: hackathon.id, title: hackathon.title, slug: hackathon.slug }}
            submission={{
              id: submission.id,
              title: submission.title,
              status: submission.status,
              content: submission.content as Record<string, unknown> | null,
              files: submission.files,
              team: submission.team,
            }}
            criteria={criteria}
            existingEvaluation={
              existingEvaluation
                ? {
                    id: existingEvaluation.id,
                    score: existingEvaluation.score,
                    comment: existingEvaluation.comment,
                    finalizedAt: existingEvaluation.finalizedAt,
                    scores: existingEvaluation.scores,
                  }
                : null
            }
          />
        </div>
      </Container>
    </section>
  );
}
