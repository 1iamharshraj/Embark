import { prisma } from "../lib/prisma";

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

async function main() {
  const now = new Date();

  const counts = {
    users: await prisma.user.count(),
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
    rolePermissions: await prisma.rolePermission.count(),
    userRoles: await prisma.userRole.count(),
    playbooks: await prisma.playbook.count(),
    mentors: await prisma.mentor.count(),
    competitions: await prisma.competition.count(),
    hackathons: await prisma.hackathon.count(),
    registrations: await prisma.registration.count(),
    submissions: await prisma.submission.count(),
    advancements: await prisma.advancement.count(),
    winners: await prisma.winner.count(),
    speakerApplications: await prisma.speakerApplication.count(),
    lectureRequests: await prisma.lectureRequest.count(),
    orders: await prisma.order.count(),
  };

  const admin = await prisma.user.findFirst({
    where: { email: "ajay.san36@gmail.com" },
    include: { roles: { include: { role: true } } },
  });
  if (!admin) fail("Admin user ajay.san36@gmail.com not found.");
  if (!admin.isAdmin) fail("Admin user does not have isAdmin=true.");
  const adminRoleNames = admin.roles.map((r) => r.role.name);
  if (!adminRoleNames.includes("Super Admin"))
    fail(`Admin user should have Super Admin role, found: ${adminRoleNames.join(", ")}`);

  const student = await prisma.user.findFirst({
    where: { email: "student@embark.local" },
    include: { roles: { include: { role: true } } },
  });
  if (!student) fail("Student user student@embark.local not found.");
  if (student.isAdmin) fail("Student user should not be an admin.");
  const studentRoleNames = student.roles.map((r) => r.role.name);
  if (!studentRoleNames.includes("Student"))
    fail(`Student user should have Student role, found: ${studentRoleNames.join(", ")}`);

  const live = await prisma.competition.count({
    where: {
      draft: false,
      regOpen: { lte: now },
      regClose: { gte: now },
    },
  });
  if (live < 1) fail("Expected at least one live competition.");

  const upcoming = await prisma.competition.count({
    where: {
      draft: false,
      regOpen: { gt: now },
    },
  });
  if (upcoming < 1) fail("Expected at least one upcoming competition.");

  const closed = await prisma.competition.count({
    where: {
      draft: false,
      regClose: { lt: now },
    },
  });
  if (closed < 1) fail("Expected at least one closed competition.");

  const drafts = await prisma.competition.count({
    where: { draft: true },
  });
  if (drafts < 1) fail("Expected at least one draft competition.");

  if (counts.playbooks < 21) fail(`Expected at least 21 playbooks, found ${counts.playbooks}.`);
  if (counts.mentors < 10) fail(`Expected at least 10 mentors, found ${counts.mentors}.`);
  if (counts.speakerApplications < 2)
    fail(`Expected at least 2 speaker applications, found ${counts.speakerApplications}.`);
  if (counts.lectureRequests < 2)
    fail(`Expected at least 2 lecture requests, found ${counts.lectureRequests}.`);

  console.log("✅ Phase 0 verification passed.");
  console.log("Counts:", counts);
  console.log(`Live: ${live}, Upcoming: ${upcoming}, Closed: ${closed}, Draft: ${drafts}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
