import { prisma } from "../lib/prisma";

const FORCE = process.argv.includes("--force");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function computeStatus(
  now: Date,
  regOpen: Date,
  regClose: Date,
  endAt: Date,
  resultAt: Date | null
): string {
  if (now < regOpen) return "PUBLISHED";
  if (now >= regOpen && now <= regClose) return "REGISTRATION_OPEN";
  if (now > regClose && now <= endAt) return "SUBMISSION_OPEN";
  if (resultAt && now > endAt && now < resultAt) return "EVALUATION";
  if (resultAt && now >= resultAt) return "RESULTS_PUBLISHED";
  return "CLOSED";
}

async function main() {
  const competitions = await prisma.competition.findMany({
    include: {
      registrations: {
        include: { submissions: true },
      },
      winners: true,
      advancements: true,
    },
  });

  if (competitions.length === 0) {
    console.log("No legacy competitions to migrate.");
    return;
  }

  const existingCount = await prisma.hackathon.count();
  if (existingCount > 0 && !FORCE) {
    console.log(
      `Found ${existingCount} existing hackathon(s). Use --force to re-run migration (will delete migrated data). Skipping.`
    );
    return;
  }

  if (FORCE) {
    console.log("Force mode: clearing migrated hackathon data...");
    await prisma.$transaction([
      prisma.certificate.deleteMany(),
      prisma.hackathonResult.deleteMany(),
      prisma.evaluationScore.deleteMany(),
      prisma.evaluation.deleteMany(),
      prisma.judgeAssignment.deleteMany(),
      prisma.judge.deleteMany(),
      prisma.submissionFile.deleteMany(),
      prisma.hackathonSubmission.deleteMany(),
      prisma.hackathonTeamMember.deleteMany(),
      prisma.hackathonTeam.deleteMany(),
      prisma.hackathonRegistration.deleteMany(),
      prisma.hackathonTimeline.deleteMany(),
      prisma.hackathon.deleteMany(),
    ]);
  }

  let skipped = 0;
  let migrated = 0;

  for (const comp of competitions) {
    let slug = comp.id || slugify(comp.title);
    if (!slug) slug = slugify(comp.title);

    const existing = await prisma.hackathon.findUnique({ where: { slug } });
    if (existing) {
      console.log(`Skipping ${comp.id} (${slug}) — already migrated.`);
      skipped++;
      continue;
    }

    const now = new Date();
    const status = computeStatus(
      now,
      comp.regOpen,
      comp.regClose,
      comp.endAt,
      comp.resultAt
    );

    const hackathon = await prisma.hackathon.create({
      data: {
        slug,
        title: comp.title,
        subtitle: comp.host || "Embark India case competition",
        banner: comp.banner || "orange",
        bannerUrl: comp.banners?.[0] || null,
        logoUrl: null,
        status,
        shortDescription: comp.about?.slice(0, 200) || comp.title,
        detailedDescription: comp.about || "",
        organizer: comp.host || "Embark India",
        category: comp.category || "General Management",
        tags: comp.category ? [comp.category] : [],
        participationMode: comp.teamMax > 1 ? "TEAM" : "INDIVIDUAL",
        teamMin: comp.teamMin || 1,
        teamMax: comp.teamMax || 1,
        eligibility: { text: comp.eligibility || "", criteria: comp.eligibilityCriteria || [] },
        fee: comp.fee || 0,
        rules: { rules: comp.rules || [], compStructure: comp.compStructure || [] },
        problemStatement: { title: comp.title, description: "" },
        evaluationCriteria: { criteria: [] },
        resources: { prizes: comp.prizes || [], submissionGuidelines: comp.submissionGuidelines || [] },
        faqs: { faqs: comp.faqs || [] },
        settings: {
          ppo: comp.ppo,
          beginner: comp.beginner,
          viewBoost: comp.viewBoost,
          seedRegs: comp.seedRegs,
          teamStructure: comp.teamStructure || [],
          institutes: comp.institutes || [],
          contacts: comp.contacts || [],
          aboutHost: comp.aboutHost || "",
        },
      },
    });

    const timelines = [
      { phase: "REGISTRATION", startsAt: comp.regOpen, endsAt: comp.regClose },
      { phase: "SUBMISSION", startsAt: comp.startAt, endsAt: comp.endAt },
      { phase: "EVALUATION", startsAt: comp.endAt, endsAt: comp.resultAt },
      { phase: "RESULT", startsAt: comp.resultAt || comp.endAt, endsAt: null },
    ].filter((t) => t.startsAt) as { phase: string; startsAt: Date; endsAt: Date | null }[];

    await prisma.hackathonTimeline.createMany({
      data: timelines.map((t) => ({
        hackathonId: hackathon.id,
        phase: t.phase,
        startsAt: t.startsAt,
        endsAt: t.endsAt,
      })),
    });

    // Migrate registrations, teams, and submissions.
    const regToTeam = new Map<string, { teamId: string; submissionId?: string }>();

    for (const reg of comp.registrations) {
      await prisma.hackathonRegistration.create({
        data: {
          hackathonId: hackathon.id,
          userId: reg.userId,
          status: "REGISTERED",
          formData: {
            teamName: reg.teamName || "",
            members: reg.members || [],
          },
        },
      });

      const team = await prisma.hackathonTeam.create({
        data: {
          hackathonId: hackathon.id,
          name: reg.teamName || "Team",
          leaderId: reg.userId,
        },
      });

      await prisma.hackathonTeamMember.create({
        data: {
          teamId: team.id,
          userId: reg.userId,
          role: "LEADER",
        },
      });

      let firstSubmissionId: string | undefined;
      for (const sub of reg.submissions) {
        const hackathonSubmission = await prisma.hackathonSubmission.create({
          data: {
            hackathonId: hackathon.id,
            teamId: team.id,
            title: sub.note || `Round ${sub.roundIdx + 1} submission`,
            content: { roundIdx: sub.roundIdx, link: sub.link || "", note: sub.note || "" },
            status: sub.link || sub.filePath ? "SUBMITTED" : "DRAFT",
            score: null,
            rank: null,
          },
        });
        if (!firstSubmissionId) firstSubmissionId = hackathonSubmission.id;

        if (sub.filePath) {
          await prisma.submissionFile.create({
            data: {
              submissionId: hackathonSubmission.id,
              name: sub.filePath.split("/").pop() || "submission",
              url: sub.filePath,
              type: "application/octet-stream",
              size: 0,
              version: 1,
            },
          });
        }
      }

      regToTeam.set(reg.id, { teamId: team.id, submissionId: firstSubmissionId });
    }

    // Migrate winners
    if (comp.winners.length > 0) {
      const resultData: {
        hackathonId: string;
        submissionId: string;
        rank: number;
        award: string;
        score: null;
        publishedAt: Date;
      }[] = [];

      for (const w of comp.winners) {
        const mapped = regToTeam.get(w.regId);
        if (!mapped?.submissionId) continue;
        resultData.push({
          hackathonId: hackathon.id,
          submissionId: mapped.submissionId,
          rank: w.rank,
          award: w.rank === 1 ? "WINNER" : w.rank === 2 ? "RUNNER_UP" : w.rank === 3 ? "FINALIST" : "SPECIAL_RECOGNITION",
          score: null,
          publishedAt: comp.resultAt || comp.endAt,
        });
      }

      if (resultData.length > 0) {
        await prisma.hackathonResult.createMany({ data: resultData });
      }
    }

    console.log(`Migrated ${comp.id} → ${hackathon.id} (${slug})`);
    migrated++;
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
