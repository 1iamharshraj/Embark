#!/usr/bin/env tsx
/**
 * Embark 2.0.0 data migration script.
 * Run this AFTER `prisma migrate deploy` has applied the 2.0.0 schema
 * to a database that contains the legacy v1 data.
 *
 * Back up the database before running.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/migrate-v2-data.ts
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const STUDENT_ROLE_NAME = "student";
const ADMIN_ROLE_NAME = "admin";

async function ensureRoles() {
  console.log("[migrate] ensuring base roles exist...");

  const studentRole = await prisma.role.upsert({
    where: { name: STUDENT_ROLE_NAME },
    create: { name: STUDENT_ROLE_NAME, description: "Default student user" },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: { name: ADMIN_ROLE_NAME },
    create: { name: ADMIN_ROLE_NAME, description: "Platform administrator" },
    update: {},
  });

  return { studentRole, adminRole };
}

async function migrateUsers(adminRoleId: string, studentRoleId: string) {
  console.log("[migrate] migrating users and profiles...");

  const users = await prisma.user.findMany({
    include: {
      roles: true,
      studentProfile: true,
    },
  });

  for (const user of users) {
    if (user.roles.length === 0) {
      const roleId = user.isAdmin ? adminRoleId : studentRoleId;
      await prisma.userRole.create({
        data: { userId: user.id, roleId },
      });
    }

    if (!user.studentProfile) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          college: user.college || undefined,
          isPublic: true,
        },
      });
    }
  }

  console.log(`[migrate] processed ${users.length} users`);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

async function migrateCompetitions() {
  console.log("[migrate] migrating competitions to hackathons...");

  const competitions = await prisma.competition.findMany({
    include: {
      registrations: true,
      submissions: true,
      winners: true,
    },
  });

  const competitionIdToHackathonId = new Map<string, string>();
  const registrationIdToHackathonRegId = new Map<string, string>();

  for (const comp of competitions) {
    const existing = await prisma.hackathon.findUnique({
      where: { slug: comp.id },
    });

    if (existing) {
      console.log(`[migrate] hackathon for competition ${comp.id} already exists, skipping`);
      competitionIdToHackathonId.set(comp.id, existing.id);
      continue;
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        slug: comp.id,
        title: comp.title,
        subtitle: `Hosted by ${comp.host}`,
        banner: comp.banner,
        status: comp.draft ? "DRAFT" : "PUBLISHED",
        shortDescription: comp.about,
        detailedDescription: comp.aboutHost || undefined,
        organizer: comp.host,
        category: comp.category,
        participationMode: comp.teamMax > 1 ? "TEAM" : "INDIVIDUAL",
        teamMin: comp.teamMin,
        teamMax: comp.teamMax,
        fee: comp.fee,
        eligibility: {
          text: comp.eligibility,
          criteria: comp.eligibilityCriteria,
        } as unknown as Prisma.InputJsonValue,
        rules: { rules: comp.rules } as unknown as Prisma.InputJsonValue,
        resources: {
          prizes: comp.prizes ? (comp.prizes as [string, string][]) : [],
          submissionGuidelines: comp.submissionGuidelines,
        } as unknown as Prisma.InputJsonValue,
        faqs: comp.faqs as unknown as Prisma.InputJsonValue | undefined,
        settings: { ppo: comp.ppo, beginner: comp.beginner },
        timelines: {
          create: [
            { phase: "Registration", startsAt: comp.regOpen, endsAt: comp.regClose },
            { phase: "Competition", startsAt: comp.startAt, endsAt: comp.endAt },
            { phase: "Results", startsAt: comp.resultAt || comp.endAt, endsAt: undefined },
          ],
        },
      },
    });

    competitionIdToHackathonId.set(comp.id, hackathon.id);
    console.log(`[migrate] created hackathon ${hackathon.id} from competition ${comp.id}`);
  }

  console.log("[migrate] migrating registrations and teams...");

  for (const comp of competitions) {
    const hackathonId = competitionIdToHackathonId.get(comp.id);
    if (!hackathonId) continue;

    for (const reg of comp.registrations) {
      const members = (reg.members as { userId?: string; name?: string; email?: string }[]) || [];
      const leaderUserId = members[0]?.userId || reg.userId;

      const hackReg = await prisma.hackathonRegistration.create({
        data: {
          hackathonId,
          userId: reg.userId,
          status: "REGISTERED",
          formData: { teamName: reg.teamName, members },
        },
      });
      registrationIdToHackathonRegId.set(reg.id, hackReg.id);

      if (comp.teamMax > 1) {
        const team = await prisma.hackathonTeam.create({
          data: {
            hackathonId,
            name: reg.teamName || "Team",
            leaderId: leaderUserId,
          },
        });

        const seen = new Set<string>();
        for (const m of members) {
          const uid = m.userId;
          if (!uid || seen.has(uid)) continue;
          seen.add(uid);
          await prisma.hackathonTeamMember.create({
            data: {
              teamId: team.id,
              userId: uid,
              role: uid === leaderUserId ? "LEADER" : "MEMBER",
            },
          });
        }
      }
    }
  }

  console.log("[migrate] migrating submissions...");

  for (const comp of competitions) {
    const hackathonId = competitionIdToHackathonId.get(comp.id);
    if (!hackathonId) continue;

    for (const sub of comp.submissions) {
      const team = await prisma.hackathonTeam.findFirst({
        where: { hackathonId, leaderId: sub.userId },
      });

      if (!team) continue;

      await prisma.hackathonSubmission.create({
        data: {
          hackathonId,
          teamId: team.id,
          title: `Submission round ${sub.roundIdx + 1}`,
          content: {
            note: sub.note,
            link: sub.link,
            roundIdx: sub.roundIdx,
          },
          status: "SUBMITTED",
          files: sub.filePath
            ? {
                create: {
                  name: "submission",
                  url: sub.filePath,
                  type: "application/octet-stream",
                  size: 0,
                },
              }
            : undefined,
        },
      });
    }
  }

  console.log("[migrate] migrating winners...");

  for (const comp of competitions) {
    const hackathonId = competitionIdToHackathonId.get(comp.id);
    if (!hackathonId) continue;

    for (const winner of comp.winners) {
      const team = await prisma.hackathonTeam.findFirst({
        where: { hackathonId, name: winner.teamName },
      });

      if (!team) continue;

      const submission = await prisma.hackathonSubmission.findUnique({
        where: { teamId: team.id },
      });

      if (!submission) continue;

      await prisma.hackathonResult.upsert({
        where: { submissionId: submission.id },
        create: {
          hackathonId,
          submissionId: submission.id,
          rank: winner.rank,
          publishedAt: new Date(),
        },
        update: {
          rank: winner.rank,
        },
      });
    }
  }

  console.log(`[migrate] processed ${competitions.length} competitions`);
}

async function migrateOrders() {
  console.log("[migrate] normalizing legacy orders...");

  const orders = await prisma.order.findMany({
    where: { orderType: "PLAYBOOK", playbookId: null },
  });

  for (const order of orders) {
    if (order.relatedId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { playbookId: order.relatedId },
      });
    }
  }

  console.log(`[migrate] normalized ${orders.length} orders`);
}

async function main() {
  console.log("[migrate] starting Embark 2.0.0 data migration...");

  const { studentRole, adminRole } = await ensureRoles();
  await migrateUsers(adminRole.id, studentRole.id);
  await migrateCompetitions();
  await migrateOrders();

  console.log("[migrate] migration completed successfully");
}

main()
  .catch((err) => {
    console.error("[migrate] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
