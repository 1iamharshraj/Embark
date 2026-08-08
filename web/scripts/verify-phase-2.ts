import { prisma } from "../lib/prisma";
import {
  assert,
  CookieJar,
  cleanupTestUser,
  disconnectPrisma,
  fetchJsonBody,
  getSession,
  nextAuthSignIn,
  startServer,
  stopServer,
  waitForServer,
  type SessionUser,
} from "./verify-lib";
import type { ChildProcess } from "node:child_process";

async function main() {
  const testEmail = "phase2test@embark.local";
  const testPassword = "TestPass123!";
  const testName = "Phase2 Test";
  const testCollege = "IIM Test";
  const newCollege = "IIM Updated";
  const changedPassword = "NewPass456!";
  const resetPassword = "ResetPass789!";

  await cleanupTestUser(testEmail);

  let server: ChildProcess | null = null;
  if (!process.env.SKIP_SERVER_START) {
    console.log("Starting Next.js dev server...");
    server = startServer();
    await waitForServer();
    console.log("Server ready.");
  }

  try {
    // 1. Admin seed user has isAdmin=true
    const admin = await prisma.user.findFirst({
      where: { email: "ajay.san36@gmail.com" },
    });
    assert(admin, "Admin seed user ajay.san36@gmail.com not found");
    assert(admin.isAdmin, "Admin seed user is not marked as admin");
    console.log("✅ Admin seed verified");

    // 2. Register test user
    const registerRes = await fetchJsonBody("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        college: testCollege,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });
    assert(registerRes.res.status === 200, `Registration failed: ${JSON.stringify(registerRes.body)}`);
    console.log("✅ Registration succeeded");

    // 3. Duplicate registration returns 409
    const dupRes = await fetchJsonBody("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        college: testCollege,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });
    assert(dupRes.res.status === 409, "Duplicate registration should return 409");
    console.log("✅ Duplicate registration blocked");

    // 4. Login and verify session
    const jar = new CookieJar();
    await nextAuthSignIn(testEmail, testPassword, jar);
    const session = await getSession(jar);
    assert(session.user?.email === testEmail, "Session email mismatch");
    assert(session.user?.name === testName, "Session name mismatch");
    assert(session.user?.college === testCollege, "Session college mismatch");
    assert(session.user?.id, "Session id missing");
    assert(session.user?.isAdmin === false, "Session isAdmin should be false");
    console.log("✅ Login and session verified");

    // 5. Update profile
    const profileRes = await fetchJsonBody("/api/account/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: testName, college: newCollege }),
      jar,
    });
    assert(profileRes.res.status === 200, "Profile update failed");
    const updatedUser = await prisma.user.findUnique({ where: { email: testEmail } });
    assert(updatedUser?.college === newCollege, "Profile college not updated in DB");
    console.log("✅ Profile update verified");

    // 6. Change password
    const changeRes = await fetchJsonBody("/api/account/change-password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: testPassword,
        newPassword: changedPassword,
        confirmNewPassword: changedPassword,
      }),
      jar,
    });
    assert(changeRes.res.status === 200, "Password change failed");

    // 7. Login with new password
    const jar2 = new CookieJar();
    await nextAuthSignIn(testEmail, changedPassword, jar2);
    const session2 = await getSession(jar2);
    assert(session2.user?.email === testEmail, "Login with new password failed");
    console.log("✅ Password change and re-login verified");

    // 8. Request password reset
    const resetRes = await fetchJsonBody("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: testEmail }),
    });
    assert(resetRes.res.status === 200, "Reset password request failed");

    // 9. Verify token created
    const tokensRes = await fetchJsonBody<{ tokens?: { email: string; token: string }[] }>(
      "/api/dev/reset-tokens",
      { jar: jar2 }
    );
    assert(tokensRes.res.status === 200, "Dev reset tokens route failed");
    const tokenRow = tokensRes.body?.tokens?.find((t) => t.email === testEmail);
    assert(tokenRow, "Reset token not found in DB");
    console.log("✅ Password reset token created");

    // 10. Verify reset token
    const verifyRes = await fetchJsonBody<{ valid: boolean }>("/api/auth/verify-reset-token", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, token: tokenRow.token }),
    });
    assert(verifyRes.body?.valid, "Reset token should be valid");

    // 11. Set new password with token
    const setRes = await fetchJsonBody("/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        token: tokenRow.token,
        password: resetPassword,
        confirmPassword: resetPassword,
      }),
    });
    assert(setRes.res.status === 200, "Set password failed");

    // 12. Login with reset password
    const jar3 = new CookieJar();
    await nextAuthSignIn(testEmail, resetPassword, jar3);
    const session3 = await getSession(jar3);
    assert(session3.user?.email === testEmail, "Login with reset password failed");
    console.log("✅ Password reset flow verified");

    // 13. /account protected by middleware without session
    const accountNoSession = await fetchJsonBody<{ location?: string }>("/account", {
      redirect: "manual",
    });
    assert(
      accountNoSession.res.status === 307 || accountNoSession.res.status === 302,
      "/account should redirect when not logged in"
    );
    const location = accountNoSession.res.headers.get("location") || "";
    assert(location.includes("/login"), "/account should redirect to /login");
    assert(location.includes("callbackUrl"), "/account redirect should include callbackUrl");
    console.log("✅ /account protected without session");

    // 14. /admin protected from non-admin user
    const adminAsNonAdmin = await fetchJsonBody("/admin", {
      redirect: "manual",
      headers: { Cookie: jar3.header() },
    });
    assert(
      adminAsNonAdmin.res.status === 307 || adminAsNonAdmin.res.status === 302,
      "/admin should redirect for non-admin"
    );
    const adminLocation = adminAsNonAdmin.res.headers.get("location") || "";
    assert(adminLocation.includes("/account"), "/admin should redirect non-admin to /account");
    console.log("✅ /admin protected from non-admin");

    // 15. /admin accessible to admin
    const adminJar = new CookieJar();
    await nextAuthSignIn("ajay.san36@gmail.com", "admin123", adminJar);
    const adminSession = await getSession(adminJar);
    assert(adminSession.user?.isAdmin, "Admin session should have isAdmin=true");
    const adminPage = await fetchJsonBody("/admin", {
      redirect: "manual",
      headers: { Cookie: adminJar.header() },
    });
    assert(adminPage.res.status === 200, "/admin should be accessible to admin");
    console.log("✅ /admin accessible to admin");

    console.log("\n✅ Phase 2 verification passed.");
  } finally {
    await cleanupTestUser(testEmail);
    await stopServer(server);
    await disconnectPrisma();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectPrisma();
  process.exit(1);
});
