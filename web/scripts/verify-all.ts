import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { prisma } from "../lib/prisma";
import {
  assert,
  BASE_URL,
  CookieJar,
  cleanupBookingRequest,
  cleanupLectureRequest,
  cleanupSpeakerApplication,
  cleanupTestUser,
  disconnectPrisma,
  fetchJson,
  fetchJsonBody,
  getSession,
  nextAuthSignIn,
  startServer,
  stopServer,
  waitForServer,
} from "./verify-lib";
import type { ChildProcess } from "node:child_process";

type TestCase = {
  name: string;
  run: () => Promise<void>;
};

class TestRunner {
  passed = 0;
  failed = 0;
  errors: string[] = [];

  async run(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      this.passed++;
      console.log(`✅ ${name}`);
    } catch (e) {
      this.failed++;
      const message = e instanceof Error ? e.message : String(e);
      this.errors.push(`${name}: ${message}`);
      console.error(`❌ ${name} - ${message}`);
    }
  }

  summary() {
    console.log(`\n${"=".repeat(40)}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    if (this.errors.length > 0) {
      console.log("\nFailures:");
      for (const err of this.errors) console.log(`  • ${err}`);
    }
    console.log(`${"=".repeat(40)}`);
  }
}

async function main() {
  const runner = new TestRunner();
  const testEmail = "verify-all-test@embark.local";
  const testPassword = "TestPass123!";
  const testName = "Verify All Test";
  const testCollege = "IIM Test";
  const changedPassword = "NewPass456!";
  const resetPassword = "ResetPass789!";

  let server: ChildProcess | null = null;
  let testUserId: string | undefined;
  let liveCompId: string | undefined;
  let registrationId: string | undefined;
  let playbookOrderId: string | undefined;
  let bookingId: string | undefined;
  let mentorshipOrderId: string | undefined;
  let speakerAppId: string | undefined;
  let lectureReqId: string | undefined;
  let studentJar = new CookieJar();
  let adminJar = new CookieJar();

  console.log("Starting Next.js dev server...");
  server = startServer();
  await waitForServer();
  console.log("Server ready.\n");

  await cleanupTestUser(testEmail);

  try {
    // ─────────────────────────────────────────────────────────────
    // Phase 0 sanity checks
    // ─────────────────────────────────────────────────────────────
    await runner.run("Phase 0: DB counts", async () => {
      const now = new Date();
      const counts = {
        users: await prisma.user.count(),
        playbooks: await prisma.playbook.count(),
        mentors: await prisma.mentor.count(),
        competitions: await prisma.competition.count(),
        registrations: await prisma.registration.count(),
        submissions: await prisma.submission.count(),
        advancements: await prisma.advancement.count(),
        winners: await prisma.winner.count(),
        speakerApplications: await prisma.speakerApplication.count(),
        lectureRequests: await prisma.lectureRequest.count(),
        orders: await prisma.order.count(),
      };
      const live = await prisma.competition.count({
        where: { draft: false, regOpen: { lte: now }, regClose: { gte: now } },
      });
      const upcoming = await prisma.competition.count({
        where: { draft: false, regOpen: { gt: now } },
      });
      const closed = await prisma.competition.count({
        where: { draft: false, regClose: { lt: now } },
      });
      const drafts = await prisma.competition.count({ where: { draft: true } });

      assert(counts.users >= 2, `Expected at least 2 users, got ${counts.users}`);
      assert(counts.playbooks >= 21, `Expected at least 21 playbooks, got ${counts.playbooks}`);
      assert(counts.mentors >= 10, `Expected at least 10 mentors, got ${counts.mentors}`);
      assert(counts.competitions >= 1, `Expected at least 1 competition, got ${counts.competitions}`);
      assert(live >= 1, `Expected at least 1 live competition, got ${live}`);
      assert(upcoming >= 1, `Expected at least 1 upcoming competition, got ${upcoming}`);
      assert(closed >= 1, `Expected at least 1 closed competition, got ${closed}`);
      assert(drafts >= 1, `Expected at least 1 draft competition, got ${drafts}`);
      console.log("   Counts:", counts);
      console.log(`   Live: ${live}, Upcoming: ${upcoming}, Closed: ${closed}, Draft: ${drafts}`);
    });

    await runner.run("Phase 0: Seed admin and student exist", async () => {
      const admin = await prisma.user.findFirst({ where: { email: "ajay.san36@gmail.com" } });
      const student = await prisma.user.findFirst({ where: { email: "student@embark.local" } });
      assert(admin, "Admin seed user not found");
      assert(admin.isAdmin, "Admin seed user is not admin");
      assert(student, "Student seed user not found");
      assert(!student.isAdmin, "Student seed user should not be admin");
    });

    // ─────────────────────────────────────────────────────────────
    // Auth flow
    // ─────────────────────────────────────────────────────────────
    await runner.run("Auth: register new test user", async () => {
      const res = await fetchJsonBody("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          college: testCollege,
          password: testPassword,
          confirmPassword: testPassword,
        }),
      });
      assert(res.res.status === 200, `Registration failed: ${JSON.stringify(res.body)}`);
    });

    await runner.run("Auth: duplicate registration blocked", async () => {
      const res = await fetchJsonBody("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          college: testCollege,
          password: testPassword,
          confirmPassword: testPassword,
        }),
      });
      assert(res.res.status === 409, `Duplicate registration should be 409, got ${res.res.status}`);
    });

    await runner.run("Auth: login and verify session", async () => {
      studentJar = new CookieJar();
      await nextAuthSignIn(testEmail, testPassword, studentJar);
      const session = await getSession(studentJar);
      assert(session.user?.email === testEmail, "Session email mismatch");
      assert(session.user?.name === testName, "Session name mismatch");
      assert(session.user?.college === testCollege, "Session college mismatch");
      assert(session.user?.id, "Session id missing");
      assert(session.user?.isAdmin === false, "Session isAdmin should be false");
      testUserId = session.user.id;
    });

    await runner.run("Auth: update profile", async () => {
      const newCollege = "IIM Updated";
      const res = await fetchJsonBody("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: testName, college: newCollege }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Profile update failed: ${JSON.stringify(res.body)}`);
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      assert(user?.college === newCollege, "College not updated in DB");
    });

    await runner.run("Auth: change password and re-login", async () => {
      const res = await fetchJsonBody("/api/account/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: testPassword,
          newPassword: changedPassword,
          confirmNewPassword: changedPassword,
        }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Password change failed: ${JSON.stringify(res.body)}`);
      studentJar = new CookieJar();
      await nextAuthSignIn(testEmail, changedPassword, studentJar);
      const session = await getSession(studentJar);
      assert(session.user?.email === testEmail, "Re-login with new password failed");
    });

    await runner.run("Auth: password reset token flow", async () => {
      const resetRes = await fetchJsonBody("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: testEmail }),
      });
      assert(resetRes.res.status === 200, `Reset request failed: ${JSON.stringify(resetRes.body)}`);

      const tokensRes = await fetchJsonBody<{ tokens?: { email: string; token: string }[] }>(
        "/api/dev/reset-tokens",
        { jar: studentJar }
      );
      assert(tokensRes.res.status === 200, `Dev tokens route failed: ${tokensRes.res.status}`);
      const tokenRow = tokensRes.body?.tokens?.find((t) => t.email === testEmail);
      assert(tokenRow, "Reset token not found");

      const verifyRes = await fetchJsonBody<{ valid: boolean }>("/api/auth/verify-reset-token", {
        method: "POST",
        body: JSON.stringify({ email: testEmail, token: tokenRow.token }),
      });
      assert(verifyRes.body?.valid, "Reset token should be valid");

      const setRes = await fetchJsonBody("/api/auth/set-password", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          token: tokenRow.token,
          password: resetPassword,
          confirmPassword: resetPassword,
        }),
      });
      assert(setRes.res.status === 200, `Set password failed: ${JSON.stringify(setRes.body)}`);

      studentJar = new CookieJar();
      await nextAuthSignIn(testEmail, resetPassword, studentJar);
      const session = await getSession(studentJar);
      assert(session.user?.email === testEmail, "Login with reset password failed");
    });

    // ─────────────────────────────────────────────────────────────
    // Competitions
    // ─────────────────────────────────────────────────────────────
    await runner.run("Competitions: public list has live/closed/upcoming", async () => {
      const res = await fetchJsonBody<{ competitions?: any[] }>("/api/competitions", { jar: studentJar });
      assert(res.res.status === 200, `Public competitions failed: ${JSON.stringify(res.body)}`);
      const comps = res.body?.competitions ?? [];
      assert(comps.length > 0, "No competitions returned");
      assert(comps.some((c) => c.status === "Live"), "No live competition");
      assert(comps.some((c) => c.status === "Closed"), "No closed competition");
      assert(!comps.some((c) => c.id === "people-case-challenge"), "Draft competition returned publicly");
      liveCompId = comps.find((c) => c.status === "Live")?.id;
      assert(liveCompId, "Live competition id missing");
    });

    await runner.run("Competitions: register for live competition", async () => {
      const res = await fetchJsonBody<{ registration?: any }>(`/api/competitions/${liveCompId}/register`, {
        method: "POST",
        body: JSON.stringify({
          teamName: "Verify All Test Team",
          members: [{ name: testName, email: testEmail, college: testCollege }],
        }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Registration failed: ${JSON.stringify(res.body)}`);
      registrationId = res.body?.registration?.id;
      assert(registrationId, "Registration id missing");
    });

    await runner.run("Competitions: duplicate registration blocked", async () => {
      const res = await fetchJsonBody(`/api/competitions/${liveCompId}/register`, {
        method: "POST",
        body: JSON.stringify({
          teamName: "Duplicate Team",
          members: [{ name: testName, email: testEmail, college: testCollege }],
        }),
        jar: studentJar,
      });
      assert(res.res.status === 409, `Duplicate registration should be 409, got ${res.res.status}`);
    });

    await runner.run("Competitions: submit round 0", async () => {
      const res = await fetchJsonBody(`/api/competitions/${liveCompId}/submit`, {
        method: "POST",
        body: JSON.stringify({ roundIdx: 0, link: "https://example.com/round0" }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Round 0 submission failed: ${JSON.stringify(res.body)}`);
    });

    await runner.run("Competitions: admin login", async () => {
      adminJar = new CookieJar();
      await nextAuthSignIn("ajay.san36@gmail.com", "admin123", adminJar);
      const session = await getSession(adminJar);
      assert(session.user?.isAdmin, "Admin login failed");
    });

    await runner.run("Competitions: admin advances team to round 1", async () => {
      const res = await fetchJsonBody(`/api/admin/competitions/${liveCompId}/advancements`, {
        method: "POST",
        body: JSON.stringify({ roundIdx: 1, regIds: [registrationId] }),
        jar: adminJar,
      });
      assert(res.res.ok, `Advancement failed: ${JSON.stringify(res.body)}`);
    });

    await runner.run("Competitions: submit round 1", async () => {
      const res = await fetchJsonBody(`/api/competitions/${liveCompId}/submit`, {
        method: "POST",
        body: JSON.stringify({ roundIdx: 1, link: "https://example.com/round1" }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Round 1 submission failed: ${JSON.stringify(res.body)}`);
    });

    await runner.run("Competitions: mark winner and generate certificate", async () => {
      const res = await fetchJsonBody<{ winners?: any[] }>(`/api/admin/competitions/${liveCompId}/winners`, {
        method: "POST",
        body: JSON.stringify({
          winners: [{ regId: registrationId, rank: 1, teamName: "Verify All Test Team" }],
        }),
        jar: adminJar,
      });
      assert(res.res.ok, `Winners save failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.winners?.some((w) => w.regId === registrationId && w.rank === 1), "Winner not recorded");

      const certRes = await fetchJson(`/api/competitions/${liveCompId}/certificate`, {
        method: "POST",
        jar: studentJar,
      });
      assert(certRes.status === 200, `Certificate failed: ${certRes.status}`);
      const contentType = certRes.headers.get("content-type") || "";
      assert(contentType.includes("image/png"), `Certificate should be PNG, got ${contentType}`);
      const buffer = await certRes.arrayBuffer();
      assert(buffer.byteLength > 0, "Certificate is empty");
    });

    // ─────────────────────────────────────────────────────────────
    // Playbooks
    // ─────────────────────────────────────────────────────────────
    await runner.run("Playbooks: access denied before purchase", async () => {
      const res = await fetchJsonBody<{ hasAccess?: boolean }>("/api/playbooks/shop-marketing/access", {
        jar: studentJar,
      });
      assert(res.res.status === 200, `Access check failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.hasAccess === false, "Should not have access before purchase");
    });

    await runner.run("Playbooks: create order", async () => {
      const res = await fetchJsonBody<{
        orderId?: string;
        keyId?: string;
        amount?: number;
        dbOrderId?: string;
      }>("/api/orders/create", {
        method: "POST",
        body: JSON.stringify({ playbookSlug: "shop-marketing" }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Order creation failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.orderId, "orderId missing");
      assert(res.body?.dbOrderId, "dbOrderId missing");
      playbookOrderId = res.body.dbOrderId;

      const order = await prisma.order.findUnique({ where: { id: playbookOrderId } });
      assert(order?.status === "pending", "Order should be pending");
    });

    await runner.run("Playbooks: verify payment in test mode", async () => {
      const order = await prisma.order.findUnique({ where: { id: playbookOrderId } });
      assert(order, "Order not found");
      const res = await fetchJsonBody<{ ok?: boolean }>("/api/orders/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_payment_id: "test_payment_all_123",
          razorpay_order_id: "test_order_all_123",
          razorpay_signature: "test_signature_all_123",
          dbOrderId: playbookOrderId,
        }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Payment verification failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.ok === true, "Verification should return ok");
    });

    await runner.run("Playbooks: access granted after purchase", async () => {
      const res = await fetchJsonBody<{ hasAccess?: boolean }>("/api/playbooks/shop-marketing/access", {
        jar: studentJar,
      });
      assert(res.res.status === 200, `Access check failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.hasAccess === true, "Should have access after purchase");
    });

    await runner.run("Playbooks: save and fetch progress", async () => {
      const post = await fetchJsonBody("/api/playbooks/general-management/progress", {
        method: "POST",
        body: JSON.stringify({ checked: [0, 1, 2] }),
        jar: studentJar,
      });
      assert(post.res.status === 200, `Progress save failed: ${JSON.stringify(post.body)}`);
      const get = await fetchJsonBody<{ checked?: number[] }>("/api/playbooks/general-management/progress", {
        jar: studentJar,
      });
      assert(get.res.status === 200, `Progress fetch failed: ${JSON.stringify(get.body)}`);
      assert(
        JSON.stringify(get.body?.checked ?? []) === JSON.stringify([0, 1, 2]),
        "Progress mismatch"
      );
    });

    await runner.run("Playbooks: account orders page", async () => {
      const res = await fetchJson("/account/orders", {
        redirect: "manual",
        headers: { Cookie: studentJar.header() },
      });
      assert(res.status === 200, `Account orders page should return 200, got ${res.status}`);
      const html = await res.text();
      assert(html.includes("Marketing"), "Account orders page should list Marketing playbook");
    });

    // ─────────────────────────────────────────────────────────────
    // Mentorship
    // ─────────────────────────────────────────────────────────────
    await runner.run("Mentorship: submit booking", async () => {
      const res = await fetchJsonBody<{ ok?: boolean; bookingRequest?: { id: string } }>("/api/mentorship/book", {
        method: "POST",
        body: JSON.stringify({
          mentorSlug: "kavitha-venkat",
          name: testName,
          email: testEmail,
          topic: "Mock interview prep for FMCG brand management roles",
          message: "Prefer weekend slots",
        }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Booking failed: ${JSON.stringify(res.body)}`);
      bookingId = res.body?.bookingRequest?.id;
      assert(bookingId, "Booking id missing");

      const booking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } });
      assert(booking?.status === "pending", "Booking should be pending");
      assert((booking?.amount ?? 0) > 0, "Booking amount should be > 0");
    });

    await runner.run("Mentorship: admin confirms booking", async () => {
      const res = await fetchJsonBody<{ ok?: boolean }>(`/api/admin/mentorship/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "confirmed" }),
        jar: adminJar,
      });
      assert(res.res.status === 200, `Confirm booking failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.ok === true, "Confirm should return ok");
      const booking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } });
      assert(booking?.status === "confirmed", "Booking should be confirmed");
    });

    await runner.run("Mentorship: create and pay order", async () => {
      const res = await fetchJsonBody<{
        orderId?: string;
        dbOrderId?: string;
        type?: string;
      }>("/api/orders/create", {
        method: "POST",
        body: JSON.stringify({ type: "mentorship", bookingRequestId: bookingId }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Mentorship order creation failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.type === "mentorship", "Order type should be mentorship");
      mentorshipOrderId = res.body?.dbOrderId;
      assert(mentorshipOrderId, "Mentorship order id missing");

      const order = await prisma.order.findUnique({ where: { id: mentorshipOrderId } });
      assert(order?.status === "pending", "Mentorship order should be pending");

      const verifyRes = await fetchJsonBody<{ ok?: boolean }>("/api/orders/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_payment_id: "test_payment_mentorship_all_123",
          razorpay_order_id: "test_order_mentorship_all_123",
          razorpay_signature: "test_signature_mentorship_all_123",
          dbOrderId: mentorshipOrderId,
        }),
        jar: studentJar,
      });
      assert(verifyRes.res.status === 200, `Mentorship payment failed: ${JSON.stringify(verifyRes.body)}`);
      assert(verifyRes.body?.ok === true, "Mentorship verification should return ok");

      const booking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } });
      assert(booking?.status === "paid", "Booking should be paid");
    });

    await runner.run("Mentorship: account mentorship page", async () => {
      const res = await fetchJson("/account/mentorship", {
        redirect: "manual",
        headers: { Cookie: studentJar.header() },
      });
      assert(res.status === 200, `Account mentorship page should return 200, got ${res.status}`);
      const html = await res.text();
      assert(html.includes("Kavitha Venkat"), "Account mentorship page should list Kavitha Venkat");
    });

    // ─────────────────────────────────────────────────────────────
    // Guest lectures
    // ─────────────────────────────────────────────────────────────
    await runner.run("Guest lectures: submit speaker application", async () => {
      const res = await fetchJsonBody<{ ok?: boolean }>("/api/speaker-applications", {
        method: "POST",
        body: JSON.stringify({
          name: "Verify All Speaker",
          email: "verify-all-speaker@embark.local",
          role: "Senior Manager",
          company: "TestCo",
          linkedIn: "https://linkedin.com/in/verifyallspeaker",
          experience: "6–10 years",
          vertical: "Marketing",
          city: "Mumbai",
          format: "Both",
          topics: "FMCG marketing, brand management, and rural go-to-market strategy",
        }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Speaker application failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.ok === true, "Speaker application should return ok");
      const app = await prisma.speakerApplication.findFirst({
        where: { email: "verify-all-speaker@embark.local" },
        orderBy: { createdAt: "desc" },
      });
      assert(app, "Speaker application not found in DB");
      assert(app.status === "pending", "Speaker application should be pending");
      speakerAppId = app.id;
    });

    await runner.run("Guest lectures: submit lecture request", async () => {
      const res = await fetchJsonBody<{ ok?: boolean }>("/api/lecture-requests", {
        method: "POST",
        body: JSON.stringify({
          institute: "IIM Test",
          name: "Prof. Verify All",
          email: "verify-all-lecture@embark.local",
          phone: "+91 9876543210",
          vertical: "Strategy",
          engagement: "Guest lecture",
          format: "Offline",
          dates: "Next month",
          audienceSize: "60–150",
          budget: "To be discussed",
          message: "Looking for a practical session on market entry strategy.",
        }),
        jar: studentJar,
      });
      assert(res.res.status === 200, `Lecture request failed: ${JSON.stringify(res.body)}`);
      assert(res.body?.ok === true, "Lecture request should return ok");
      const req = await prisma.lectureRequest.findFirst({
        where: { email: "verify-all-lecture@embark.local" },
        orderBy: { createdAt: "desc" },
      });
      assert(req, "Lecture request not found in DB");
      assert(req.status === "pending", "Lecture request should be pending");
      lectureReqId = req.id;
    });

    await runner.run("Guest lectures: admin lists include new records", async () => {
      const speakerRes = await fetchJsonBody<{ applications?: { id: string }[] }>("/api/speaker-applications", {
        jar: adminJar,
      });
      assert(speakerRes.res.status === 200, `Speaker list failed: ${JSON.stringify(speakerRes.body)}`);
      assert(
        speakerRes.body?.applications?.some((a) => a.id === speakerAppId),
        "Speaker list should include new application"
      );

      const lectureRes = await fetchJsonBody<{ requests?: { id: string }[] }>("/api/lecture-requests", {
        jar: adminJar,
      });
      assert(lectureRes.res.status === 200, `Lecture list failed: ${JSON.stringify(lectureRes.body)}`);
      assert(
        lectureRes.body?.requests?.some((r) => r.id === lectureReqId),
        "Lecture list should include new request"
      );
    });

    await runner.run("Guest lectures: admin updates statuses", async () => {
      const speakerRes = await fetchJsonBody<{ ok?: boolean }>(`/api/admin/speaker-applications/${speakerAppId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "verified" }),
        jar: adminJar,
      });
      assert(speakerRes.res.status === 200, `Verify speaker failed: ${JSON.stringify(speakerRes.body)}`);
      const app = await prisma.speakerApplication.findUnique({ where: { id: speakerAppId } });
      assert(app?.status === "verified", "Speaker application should be verified");

      const lectureRes = await fetchJsonBody<{ ok?: boolean }>(`/api/admin/lecture-requests/${lectureReqId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "shortlisted" }),
        jar: adminJar,
      });
      assert(lectureRes.res.status === 200, `Shortlist lecture failed: ${JSON.stringify(lectureRes.body)}`);
      const req = await prisma.lectureRequest.findUnique({ where: { id: lectureReqId } });
      assert(req?.status === "shortlisted", "Lecture request should be shortlisted");
    });

    await runner.run("Guest lectures: account requests page", async () => {
      const res = await fetchJson("/account/requests", {
        redirect: "manual",
        headers: { Cookie: studentJar.header() },
      });
      assert(res.status === 200, `Account requests page should return 200, got ${res.status}`);
      const html = await res.text();
      assert(html.includes("Speaker applications"), "Account requests page should list speaker applications");
      assert(html.includes("Lecture requests"), "Account requests page should list lecture requests");
    });

    // ─────────────────────────────────────────────────────────────
    // Admin guards and PWA / redirects
    // ─────────────────────────────────────────────────────────────
    await runner.run("Guards: /account redirects to /login when not logged in", async () => {
      const res = await fetchJson("/account", { redirect: "manual" });
      assert(res.status === 307 || res.status === 302, `/account should redirect, got ${res.status}`);
      const location = res.headers.get("location") || "";
      assert(location.includes("/login"), `/account should redirect to /login`);
      assert(location.includes("callbackUrl"), `/account redirect should include callbackUrl`);
    });

    await runner.run("Guards: /admin redirects to /account for non-admin", async () => {
      const res = await fetchJson("/admin", {
        redirect: "manual",
        headers: { Cookie: studentJar.header() },
      });
      assert(res.status === 307 || res.status === 302, `/admin should redirect, got ${res.status}`);
      const location = res.headers.get("location") || "";
      assert(location.includes("/account"), `/admin should redirect non-admin to /account`);
    });

    await runner.run("Guards: admin APIs reject unauthenticated requests", async () => {
      const res = await fetchJson("/api/admin/competitions", { redirect: "manual" });
      assert(res.status === 401 || res.status === 403, `Admin API should reject unauthenticated, got ${res.status}`);
    });

    await runner.run("Guards: admin APIs reject non-admin session", async () => {
      const res = await fetchJson("/api/admin/competitions", {
        redirect: "manual",
        headers: { Cookie: studentJar.header() },
      });
      assert(res.status === 403, `Admin API should reject non-admin, got ${res.status}`);
    });

    await runner.run("PWA / redirects: manifest and icons", async () => {
      const files = (await readdir(join(process.cwd(), "public")).catch(() => [])) as string[];
      assert(files.includes("manifest.json"), "manifest.json missing");
      assert(files.includes("icon-192x192.png"), "icon-192x192.png missing");
      assert(files.includes("icon-512x512.png"), "icon-512x512.png missing");
      const raw = await readFile(join(process.cwd(), "public", "manifest.json"), "utf-8");
      const manifest = JSON.parse(raw) as Record<string, unknown>;
      assert(manifest.name && manifest.short_name, "manifest missing name/short_name");
    });

    await runner.run("PWA / redirects: /sitemap.xml returns 200", async () => {
      const res = await fetchJson("/sitemap.xml", { redirect: "manual" });
      assert(res.status === 200, `/sitemap.xml should return 200, got ${res.status}`);
      const text = await res.text();
      assert(text.startsWith("<?xml") || text.includes("<urlset"), "/sitemap.xml is not valid XML");
    });

    await runner.run("PWA / redirects: /robots.txt exists", async () => {
      const raw = await readFile(join(process.cwd(), "public", "robots.txt"), "utf-8");
      assert(raw.includes("/sitemap.xml"), "robots.txt missing sitemap reference");
    });

    await runner.run("PWA / redirects: old .html URLs redirect", async () => {
      for (const path of ["/index.html", "/competitions.html", "/playbooks.html"]) {
        const res = await fetchJson(path, { redirect: "manual" });
        assert(
          res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308,
          `${path} should redirect, got ${res.status}`
        );
      }
    });

    await runner.run("Dev route: /api/dev/reset-tokens is development-only", async () => {
      // The server under test runs with NODE_ENV=development, so the route should be 200.
      const res = await fetchJsonBody("/api/dev/reset-tokens", { redirect: "manual" });
      assert(res.res.status === 200, `Dev route returned ${res.res.status}, expected 200 in development`);

      // Inspect the route source to confirm it returns 404 outside development.
      const routeFile = await readFile(join(process.cwd(), "app", "api", "dev", "reset-tokens", "route.ts"), "utf-8");
      assert(
        routeFile.includes('process.env.NODE_ENV !== "development"') && routeFile.includes("status: 404"),
        "Dev route should guard against non-development environments"
      );
    });
  } finally {
    // Cleanup
    if (playbookOrderId) await prisma.order.deleteMany({ where: { id: playbookOrderId } });
    if (mentorshipOrderId) await prisma.order.deleteMany({ where: { id: mentorshipOrderId } });
    if (bookingId) await cleanupBookingRequest(bookingId);
    if (speakerAppId) await cleanupSpeakerApplication(speakerAppId);
    if (lectureReqId) await cleanupLectureRequest(lectureReqId);
    await cleanupTestUser(testEmail);

    await stopServer(server);
    await disconnectPrisma();
  }

  runner.summary();
  if (runner.failed > 0) {
    process.exit(1);
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectPrisma();
  process.exit(1);
});
