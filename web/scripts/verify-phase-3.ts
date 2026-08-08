import { prisma } from "../lib/prisma";
import { spawn, type ChildProcess } from "node:child_process";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}

class CookieJar {
  private cookies: Map<string, string> = new Map();

  store(headers: Headers) {
    const setCookie = headers.getSetCookie?.() ?? headers.get("set-cookie")?.split(", ") ?? [];
    for (const raw of setCookie) {
      const [nameValue] = raw.split(";");
      const [name, value] = nameValue.split("=");
      if (name && value) this.cookies.set(name.trim(), value.trim());
    }
  }

  header(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  clone(): CookieJar {
    const copy = new CookieJar();
    copy.cookies = new Map(this.cookies);
    return copy;
  }
}

async function fetchJson(path: string, options: RequestInit & { jar?: CookieJar } = {}) {
  const headers = new Headers(options.headers);
  if (options.jar) headers.set("Cookie", options.jar.header());
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  options.jar?.store(res.headers);
  return res;
}

async function fetchJsonBody<T>(path: string, options: RequestInit & { jar?: CookieJar } = {}) {
  const res = await fetchJson(path, options);
  const text = await res.text();
  let body: T | undefined;
  try {
    body = text ? (JSON.parse(text) as T) : undefined;
  } catch {
    body = undefined;
  }
  return { res, body };
}

async function nextAuthSignIn(email: string, password: string, jar: CookieJar) {
  const csrfRes = await fetchJson("/api/auth/csrf", { jar });
  const csrfJson = await csrfRes.json().catch(() => ({} as { csrfToken?: string }));
  const csrfToken = csrfJson.csrfToken;
  if (!csrfToken) fail("Could not get CSRF token");

  const params = new URLSearchParams();
  params.set("csrfToken", csrfToken);
  params.set("email", email);
  params.set("password", password);
  params.set("callbackUrl", "/account");
  params.set("json", "true");

  const res = await fetchJson("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    jar,
  });

  const json = await res.json().catch(() => ({} as { url?: string; error?: string }));
  assert(res.ok && !json.error && !json.url?.includes("error"), `Login failed for ${email}`);
  return json;
}

async function getSession(jar: CookieJar): Promise<{ user?: { id: string; email: string; name: string; college: string; isAdmin: boolean } }> {
  const res = await fetchJson("/api/auth/session", { jar });
  return res.json();
}

async function waitForServer(timeoutMs = 120000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/session`);
      if (res.status === 200) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  fail("Server did not start in time");
}

function startServer(): ChildProcess {
  const proc = spawn("npx", ["next", "dev"], {
    cwd: process.cwd(),
    stdio: "pipe",
    shell: process.platform === "win32",
    env: { ...process.env, NODE_ENV: "development" },
  });

  proc.stdout?.on("data", (data) => {
    const line = data.toString();
    if (line.includes("error") || line.includes("Error") || line.includes("Failed")) {
      console.error("[server]", line.trim());
    }
  });

  proc.stderr?.on("data", (data) => {
    console.error("[server]", data.toString().trim());
  });

  return proc;
}

async function cleanupTestUser(email: string) {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.registration.deleteMany({
    where: { user: { email } },
  });
}

async function main() {
  const testEmail = "phase3student@embark.local";
  const testPassword = "TestPass123!";
  const testName = "Phase 3 Student";
  const testCollege = "IIM Test";

  await cleanupTestUser(testEmail);

  let server: ChildProcess | null = null;
  if (!process.env.SKIP_SERVER_START) {
    console.log("Starting Next.js dev server...");
    server = startServer();
    await waitForServer();
    console.log("Server ready.");
  }

  try {
    // 1. Create test student user
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
    console.log("✅ Test student created");

    // 2. Login as student
    const studentJar = new CookieJar();
    await nextAuthSignIn(testEmail, testPassword, studentJar);
    const session = await getSession(studentJar);
    assert(session.user?.email === testEmail, "Session email mismatch");
    console.log("✅ Student login succeeded");

    // 3. Fetch public competitions and verify only published
    const publicComps = await fetchJsonBody<{ competitions?: any[] }>("/api/competitions", { jar: studentJar });
    assert(publicComps.res.status === 200, "Public competitions endpoint failed");
    assert(publicComps.body?.competitions && publicComps.body.competitions.length > 0, "No competitions returned");
    assert(
      publicComps.body.competitions.every((c) => typeof c.status === "string" && typeof c.registrationCount === "number"),
      "Competition status or count missing"
    );
    assert(!publicComps.body.competitions.some((c) => c.id === "people-case-challenge"), "Draft competition returned publicly");
    console.log("✅ Public competitions list valid");

    const liveComp = publicComps.body.competitions.find((c) => c.status === "Live");
    assert(liveComp, "No live competition found");
    const compId = liveComp.id;

    // 4. Register for live competition
    const registerCompRes = await fetchJsonBody<{ registration?: any }>(`/api/competitions/${compId}/register`, {
      method: "POST",
      body: JSON.stringify({
        teamName: "Phase 3 Test Team",
        members: [{ name: testName, email: testEmail, college: testCollege }],
      }),
      jar: studentJar,
    });
    assert(registerCompRes.res.status === 200, `Competition registration failed: ${JSON.stringify(registerCompRes.body)}`);
    const regId = registerCompRes.body?.registration?.id;
    assert(regId, "Registration id missing");
    console.log("✅ Registered for live competition");

    // 5. Duplicate registration blocked
    const dupRegRes = await fetchJsonBody(`/api/competitions/${compId}/register`, {
      method: "POST",
      body: JSON.stringify({
        teamName: "Duplicate Team",
        members: [{ name: testName, email: testEmail, college: testCollege }],
      }),
      jar: studentJar,
    });
    assert(dupRegRes.res.status === 409, "Duplicate registration should be blocked");
    console.log("✅ Duplicate registration blocked");

    // 6. Closed competition registration blocked
    const closedComp = publicComps.body.competitions.find((c) => c.status === "Closed");
    assert(closedComp, "No closed competition found");
    const closedRegRes = await fetchJsonBody(`/api/competitions/${closedComp.id}/register`, {
      method: "POST",
      body: JSON.stringify({
        teamName: "Closed Team",
        members: [{ name: testName, email: testEmail, college: testCollege }],
      }),
      jar: studentJar,
    });
    assert(closedRegRes.res.status === 400, "Closed competition registration should be blocked");
    console.log("✅ Closed competition registration blocked");

    // 7. Submit link for round 0
    const submitRes = await fetchJsonBody<{ submission?: any }>(`/api/competitions/${compId}/submit`, {
      method: "POST",
      body: JSON.stringify({ roundIdx: 0, link: "https://example.com/phase3-submission" }),
      jar: studentJar,
    });
    assert(submitRes.res.status === 200, `Round 0 submission failed: ${JSON.stringify(submitRes.body)}`);
    console.log("✅ Round 0 submission succeeded");

    // 8. Invalid round submission blocked
    const invalidSubmitRes = await fetchJsonBody(`/api/competitions/${compId}/submit`, {
      method: "POST",
      body: JSON.stringify({ roundIdx: 99, link: "https://example.com" }),
      jar: studentJar,
    });
    assert(invalidSubmitRes.res.status === 400, "Invalid round submission should be blocked");
    console.log("✅ Invalid round submission blocked");

    // 9. Login as admin
    const adminJar = new CookieJar();
    await nextAuthSignIn("ajay.san36@gmail.com", "admin123", adminJar);
    const adminSession = await getSession(adminJar);
    assert(adminSession.user?.isAdmin, "Admin session should be admin");
    console.log("✅ Admin login succeeded");

    // 10. Advance test registration to round 1
    const advanceRes = await fetchJsonBody(`/api/admin/competitions/${compId}/advancements`, {
      method: "POST",
      body: JSON.stringify({ roundIdx: 1, regIds: [regId] }),
      jar: adminJar,
    });
    assert(advanceRes.res.ok, `Advancement failed: ${JSON.stringify(advanceRes.body)}`);
    console.log("✅ Advanced to round 1");

    // 11. Submit for round 1 as student
    const round1SubmitRes = await fetchJsonBody<{ submission?: any }>(`/api/competitions/${compId}/submit`, {
      method: "POST",
      body: JSON.stringify({ roundIdx: 1, link: "https://example.com/round1" }),
      jar: studentJar,
    });
    assert(round1SubmitRes.res.status === 200, `Round 1 submission failed: ${JSON.stringify(round1SubmitRes.body)}`);
    console.log("✅ Round 1 submission succeeded");

    // 12. Mark test registration as winner (rank 1)
    const winnersRes = await fetchJsonBody<{ winners?: any[] }>(`/api/admin/competitions/${compId}/winners`, {
      method: "POST",
      body: JSON.stringify({ winners: [{ regId, rank: 1, teamName: "Phase 3 Test Team" }] }),
      jar: adminJar,
    });
    assert(winnersRes.res.ok, `Winners save failed: ${JSON.stringify(winnersRes.body)}`);
    assert(winnersRes.body?.winners?.some((w) => w.regId === regId && w.rank === 1), "Winner not recorded");
    console.log("✅ Winner marked");

    // 13. Download winner certificate
    const winnerCertRes = await fetchJson(`/api/competitions/${compId}/certificate`, {
      method: "POST",
      jar: studentJar,
    });
    assert(winnerCertRes.status === 200, "Winner certificate should return 200");
    const winnerContentType = winnerCertRes.headers.get("content-type") || "";
    assert(winnerContentType.includes("image/png"), `Winner certificate should be image/png, got ${winnerContentType}`);
    const winnerBuffer = await winnerCertRes.arrayBuffer();
    assert(winnerBuffer.byteLength > 0, "Winner certificate should not be empty");
    console.log("✅ Winner certificate generated");

    // 14. Remove winner and download participation certificate for the closed competition
    await fetchJson(`/api/admin/competitions/${compId}/winners`, {
      method: "POST",
      body: JSON.stringify({ winners: [] }),
      jar: adminJar,
    });

    const partCertRes = await fetchJson(`/api/competitions/${closedComp.id}/certificate`, {
      method: "POST",
      jar: studentJar,
    });
    // The student may not be registered for the closed comp; if not, expect 403.
    if (partCertRes.status === 200) {
      const partContentType = partCertRes.headers.get("content-type") || "";
      assert(partContentType.includes("image/png"), `Participation certificate should be image/png, got ${partContentType}`);
      const partBuffer = await partCertRes.arrayBuffer();
      assert(partBuffer.byteLength > 0, "Participation certificate should not be empty");
      console.log("✅ Participation certificate generated");
    } else {
      assert(partCertRes.status === 403 || partCertRes.status === 400, `Unexpected participation certificate status: ${partCertRes.status}`);
      console.log("ℹ️ Participation certificate skipped (not registered for closed comp)");
    }

    // 15. Admin list includes drafts and published
    const adminListRes = await fetchJsonBody<{ competitions?: any[] }>("/api/admin/competitions", { jar: adminJar });
    assert(adminListRes.res.ok, "Admin list failed");
    assert(adminListRes.body?.competitions && adminListRes.body.competitions.length > 0, "Admin competitions empty");
    assert(adminListRes.body.competitions.some((c) => c.draft === true), "Admin list should include drafts");
    assert(adminListRes.body.competitions.some((c) => c.draft === false), "Admin list should include published");
    console.log("✅ Admin list includes drafts and published");

    // 16. Public competition detail page returns 200
    const detailRes = await fetch(`${BASE_URL}/competition/${compId}`, { redirect: "manual" });
    assert(detailRes.status === 200, `Public competition detail should return 200, got ${detailRes.status}`);
    console.log("✅ Public competition detail page returns 200");

    // 17. Draft competition page returns 404
    const draftDetailRes = await fetch(`${BASE_URL}/competition/people-case-challenge`, { redirect: "manual" });
    assert(draftDetailRes.status === 404, `Draft competition detail should return 404, got ${draftDetailRes.status}`);
    console.log("✅ Draft competition detail page returns 404");

    console.log("\n✅ Phase 3 verification passed.");
  } finally {
    await cleanupTestUser(testEmail);
    if (server) {
      server.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 2000));
      if (!server.killed) server.kill("SIGKILL");
    }
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
