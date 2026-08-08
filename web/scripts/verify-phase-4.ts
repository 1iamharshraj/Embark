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
  await prisma.order.deleteMany({ where: { user: { email } } });
  await prisma.playbookProgress.deleteMany({ where: { user: { email } } });
  await prisma.user.deleteMany({ where: { email } });
}

async function main() {
  const testEmail = "phase4student@embark.local";
  const testPassword = "TestPass123!";
  const testName = "Phase 4 Student";
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

    // 3. Playbooks landing page returns 200
    const landingRes = await fetch(`${BASE_URL}/playbooks`, { redirect: "manual" });
    assert(landingRes.status === 200, `Playbooks landing page should return 200, got ${landingRes.status}`);
    console.log("✅ Playbooks landing page returns 200");

    // 4. Access check for shop-marketing should be false initially
    const accessBefore = await fetchJsonBody<{ hasAccess?: boolean }>("/api/playbooks/shop-marketing/access", {
      jar: studentJar,
    });
    assert(accessBefore.res.status === 200, `Access check failed: ${JSON.stringify(accessBefore.body)}`);
    assert(accessBefore.body?.hasAccess === false, "Shop playbook should not be accessible before purchase");
    console.log("✅ Access denied before purchase");

    // 5. Create an order
    const createOrderRes = await fetchJsonBody<{
      orderId?: string;
      keyId?: string;
      amount?: number;
      dbOrderId?: string;
      playbook?: { slug: string; name: string; price: number };
      error?: string;
    }>("/api/orders/create", {
      method: "POST",
      body: JSON.stringify({ playbookSlug: "shop-marketing" }),
      jar: studentJar,
    });
    assert(createOrderRes.res.status === 200, `Order creation failed: ${JSON.stringify(createOrderRes.body)}`);
    assert(createOrderRes.body?.orderId, "orderId missing");
    assert(createOrderRes.body?.keyId, "keyId missing");
    assert(typeof createOrderRes.body?.amount === "number", "amount missing");
    assert(createOrderRes.body?.dbOrderId, "dbOrderId missing");
    console.log("✅ Order created with Razorpay details");

    const dbOrderId = createOrderRes.body.dbOrderId;

    // 6. Verify order is pending in the database
    const pendingOrder = await prisma.order.findUnique({ where: { id: dbOrderId } });
    assert(pendingOrder?.status === "pending", "Order should be pending in DB");
    console.log("✅ Order is pending in DB");

    // 7. Verify payment with dummy test credentials
    const verifyRes = await fetchJsonBody<{ ok?: boolean; error?: string }>("/api/orders/verify", {
      method: "POST",
      body: JSON.stringify({
        razorpay_payment_id: "test_payment_123",
        razorpay_order_id: createOrderRes.body.orderId,
        razorpay_signature: "test_signature_123",
        dbOrderId,
      }),
      jar: studentJar,
    });
    assert(verifyRes.res.status === 200, `Payment verification failed: ${JSON.stringify(verifyRes.body)}`);
    assert(verifyRes.body?.ok === true, "Verification should return ok: true");
    console.log("✅ Payment verified in test mode");

    // 8. Verify order is marked paid in DB
    const paidOrder = await prisma.order.findUnique({ where: { id: dbOrderId } });
    assert(paidOrder?.status === "paid", "Order should be paid in DB");
    console.log("✅ Order marked paid in DB");

    // 9. Access check should now be true
    const accessAfter = await fetchJsonBody<{ hasAccess?: boolean }>("/api/playbooks/shop-marketing/access", {
      jar: studentJar,
    });
    assert(accessAfter.res.status === 200, `Access check failed: ${JSON.stringify(accessAfter.body)}`);
    assert(accessAfter.body?.hasAccess === true, "Shop playbook should be accessible after purchase");
    console.log("✅ Access granted after purchase");

    // 10. Save progress for a stream playbook
    const progressPost = await fetchJsonBody("/api/playbooks/general-management/progress", {
      method: "POST",
      body: JSON.stringify({ checked: [0, 1] }),
      jar: studentJar,
    });
    assert(progressPost.res.status === 200, `Progress save failed: ${JSON.stringify(progressPost.body)}`);
    console.log("✅ Progress saved");

    // 11. Fetch progress back
    const progressGet = await fetchJsonBody<{ checked?: number[] }>("/api/playbooks/general-management/progress", {
      jar: studentJar,
    });
    assert(progressGet.res.status === 200, `Progress fetch failed: ${JSON.stringify(progressGet.body)}`);
    assert(
      JSON.stringify(progressGet.body?.checked ?? []) === JSON.stringify([0, 1]),
      "Progress should return [0, 1]"
    );
    console.log("✅ Progress fetched correctly");

    // 12. Account orders page lists the paid order
    const accountOrdersRes = await fetch(`${BASE_URL}/account/orders`, {
      redirect: "manual",
      headers: { Cookie: studentJar.header() },
    });
    assert(accountOrdersRes.status === 200, `Account orders page should return 200, got ${accountOrdersRes.status}`);
    const accountOrdersHtml = await accountOrdersRes.text();
    assert(accountOrdersHtml.includes("Marketing"), "Account orders page should list the paid playbook");
    console.log("✅ Account orders page lists paid order");

    // 13. Login as admin and fetch admin orders API
    const adminJar = new CookieJar();
    await nextAuthSignIn("ajay.san36@gmail.com", "admin123", adminJar);
    const adminSession = await getSession(adminJar);
    assert(adminSession.user?.isAdmin, "Admin session should be admin");
    console.log("✅ Admin login succeeded");

    const adminOrdersApi = await fetchJsonBody<{ orders?: any[] }>("/api/admin/orders", { jar: adminJar });
    assert(adminOrdersApi.res.status === 200, `Admin orders API failed: ${JSON.stringify(adminOrdersApi.body)}`);
    assert(
      adminOrdersApi.body?.orders && adminOrdersApi.body.orders.some((o) => o.id === dbOrderId),
      "Admin orders should include the test order"
    );
    console.log("✅ Admin orders API returns orders");

    // 14. Admin orders page renders
    const adminOrdersPage = await fetch(`${BASE_URL}/admin/orders`, {
      redirect: "manual",
      headers: { Cookie: adminJar.header() },
    });
    assert(adminOrdersPage.status === 200, `Admin orders page should return 200, got ${adminOrdersPage.status}`);
    console.log("✅ Admin orders page renders");

    console.log("\n✅ Phase 4 verification passed.");
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
