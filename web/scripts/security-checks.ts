import { readFile } from "fs/promises";
import { join } from "path";
import {
  assert,
  CookieJar,
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

type SecurityCheck = { name: string; fn: () => Promise<void> };

class SecurityRunner {
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
    console.log(`Security checks passed: ${this.passed}`);
    console.log(`Security checks failed: ${this.failed}`);
    if (this.errors.length) {
      console.log("\nFailures:");
      for (const err of this.errors) console.log(`  • ${err}`);
    }
    console.log(`${"=".repeat(40)}`);
  }
}

async function main() {
  const runner = new SecurityRunner();
  let server: ChildProcess | null = null;

  console.log("Starting Next.js dev server...");
  server = startServer();
  await waitForServer();
  console.log("Server ready.\n");

  try {
    const studentJar = new CookieJar();
    await nextAuthSignIn("student@embark.local", "student123", studentJar);
    const studentSession = await getSession(studentJar);
    assert(studentSession.user?.email === "student@embark.local", "Student login failed");
    assert(!studentSession.user?.isAdmin, "Student should not be admin");

    const adminPaths = [
      "/api/admin/competitions",
      "/api/admin/orders",
      "/api/admin/notifications",
      "/api/speaker-applications",
      "/api/lecture-requests",
    ];

    for (const path of adminPaths) {
      await runner.run(`Unauthenticated ${path} returns 401/403`, async () => {
        const res = await fetchJson(path, { redirect: "manual" });
        assert(
          res.status === 401 || res.status === 403,
          `${path} returned ${res.status}, expected 401/403`
        );
      });

      await runner.run(`Non-admin ${path} returns 403`, async () => {
        const res = await fetchJson(path, {
          redirect: "manual",
          headers: { Cookie: studentJar.header() },
        });
        assert(res.status === 403, `${path} returned ${res.status}, expected 403`);
      });
    }

    await runner.run("/api/dev/reset-tokens is development-only by source guard", async () => {
      const routeFile = await readFile(join(process.cwd(), "app", "api", "dev", "reset-tokens", "route.ts"), "utf-8");
      assert(
        routeFile.includes('process.env.NODE_ENV !== "development"') && routeFile.includes("status: 404"),
        "Dev route should guard against non-development environments"
      );
      // Current server runs in development, so the route is reachable.
      const res = await fetchJsonBody("/api/dev/reset-tokens", { redirect: "manual" });
      assert(res.res.status === 200, `Dev route returned ${res.res.status}, expected 200 in development`);
    });
  } finally {
    await stopServer(server);
    await disconnectPrisma();
  }

  runner.summary();
  if (runner.failed > 0) process.exit(1);
}

main().catch(async (e) => {
  console.error(e);
  await disconnectPrisma();
  process.exit(1);
});
