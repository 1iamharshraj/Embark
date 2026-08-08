import { spawn, type ChildProcess } from "node:child_process";
import { prisma } from "../lib/prisma";

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}

export class CookieJar {
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

export async function fetchJson(path: string, options: RequestInit & { jar?: CookieJar } = {}) {
  const headers = new Headers(options.headers);
  if (options.jar) headers.set("Cookie", options.jar.header());
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  options.jar?.store(res.headers);
  return res;
}

export async function fetchJsonBody<T>(path: string, options: RequestInit & { jar?: CookieJar } = {}) {
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

export async function nextAuthSignIn(email: string, password: string, jar: CookieJar) {
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

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  college: string;
  isAdmin: boolean;
};

export async function getSession(jar: CookieJar): Promise<{ user?: SessionUser }> {
  const res = await fetchJson("/api/auth/session", { jar });
  return res.json();
}

export async function waitForServer(timeoutMs = 120000): Promise<void> {
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

export function startServer(): ChildProcess {
  const nextBin = require.resolve("next/dist/bin/next");
  const proc = spawn("node", [nextBin, "dev"], {
    cwd: process.cwd(),
    stdio: "pipe",
    shell: false,
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

export async function stopServer(server: ChildProcess | null) {
  if (server) {
    server.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 2000));
    if (!server.killed) server.kill("SIGKILL");
  }
}

export async function cleanupTestUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  await prisma.$transaction([
    prisma.order.deleteMany({ where: { userId: user.id } }),
    prisma.playbookProgress.deleteMany({ where: { userId: user.id } }),
    prisma.registration.deleteMany({ where: { userId: user.id } }),
    prisma.submission.deleteMany({ where: { userId: user.id } }),
    prisma.bookingRequest.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.deleteMany({ where: { email } }),
    prisma.user.delete({ where: { email } }),
  ]);
}

export async function cleanupBookingRequest(id: string) {
  await prisma.order.deleteMany({ where: { bookingRequestId: id } });
  await prisma.bookingRequest.deleteMany({ where: { id } });
}

export async function cleanupSpeakerApplication(id: string) {
  await prisma.speakerApplication.deleteMany({ where: { id } });
}

export async function cleanupLectureRequest(id: string) {
  await prisma.lectureRequest.deleteMany({ where: { id } });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
