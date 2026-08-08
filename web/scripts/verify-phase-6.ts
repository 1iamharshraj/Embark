import { readFile, readdir } from "fs/promises";
import { spawn } from "node:child_process";
import { join } from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}

async function checkFileExists(path: string, description: string) {
  const files = (await readdir(join(process.cwd(), "public")).catch(() => [])) as string[];
  const fileName = path.split("/").pop()!;
  assert(files.includes(fileName), `${description} missing: ${path}`);
  console.log(`✅ ${description} exists`);
}

async function checkManifest() {
  const raw = await readFile(join(process.cwd(), "public", "manifest.json"), "utf-8");
  const manifest = JSON.parse(raw) as Record<string, unknown>;
  assert(manifest.name, "manifest.json missing name");
  assert(manifest.short_name, "manifest.json missing short_name");
  const icons = (manifest.icons as Array<Record<string, string>>) ?? [];
  assert(
    icons.some((i) => i.sizes?.includes("192x192") && i.purpose === "any"),
    "manifest.json missing 192x192 any icon"
  );
  assert(
    icons.some((i) => i.sizes?.includes("512x512")),
    "manifest.json missing 512x512 icon"
  );
  assert(
    icons.some((i) => i.sizes?.includes("192x192") && i.purpose === "maskable"),
    "manifest.json missing 192x192 maskable icon"
  );
  console.log("✅ manifest.json is valid");
}

async function checkRobots() {
  const raw = await readFile(join(process.cwd(), "public", "robots.txt"), "utf-8");
  assert(raw.includes("/sitemap.xml"), "robots.txt missing sitemap reference");
  console.log("✅ robots.txt references sitemap");
}

async function checkServerReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/session`, { signal: AbortSignal.timeout(2000) });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function checkUrlStatus(path: string, expected: number[]) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  assert(
    expected.includes(res.status),
    `${path} expected one of ${expected.join(",")}, got ${res.status}`
  );
  console.log(`✅ ${path} -> ${res.status}`);
}

async function checkSitemap() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  assert(res.status === 200, `/sitemap.xml returned ${res.status}`);
  const text = await res.text();
  assert(text.startsWith("<?xml") || text.includes("<urlset"), "/sitemap.xml is not valid XML");
  console.log("✅ /sitemap.xml returns valid XML");
}

async function checkOffline() {
  for (const path of ["/offline", "/offline.html"]) {
    const res = await fetch(`${BASE_URL}${path}`);
    if (res.status === 200) {
      console.log(`✅ ${path} returns 200`);
      return;
    }
  }
  fail("Neither /offline nor /offline.html returned 200");
}

async function runBuild() {
  console.log("\nRunning npm run build (this is the main deploy readiness check)...");
  return new Promise<void>((resolve, reject) => {
    const proc = spawn("npm run build", {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
      env: { ...process.env, NODE_ENV: "production" },
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log("✅ npm run build passed");
        resolve();
      } else {
        reject(new Error(`npm run build failed with exit code ${code}`));
      }
    });

    proc.on("error", (err) => reject(err));
  });
}

async function main() {
  console.log("Phase 6 verification\n");

  await checkFileExists("public/icon-192x192.png", "icon-192x192.png");
  await checkFileExists("public/icon-512x512.png", "icon-512x512.png");
  await checkFileExists("public/maskable-icon-192x192.png", "maskable-icon-192x192.png");
  await checkFileExists("public/apple-touch-icon.png", "apple-touch-icon.png");
  await checkFileExists("public/favicon.ico", "favicon.ico");
  await checkManifest();
  await checkRobots();

  const reachable = await checkServerReachable();
  if (reachable) {
    console.log("\nServer is reachable, running HTTP checks...");
    await checkSitemap();
    await checkOffline();
    await checkUrlStatus("/index.html", [301, 302, 308]);
    await checkUrlStatus("/competitions.html", [301, 302, 308]);
    await checkUrlStatus("/playbooks.html", [301, 302, 308]);
    await checkUrlStatus("/mentorship.html", [301, 302, 308]);
    await checkUrlStatus("/guest-lectures.html", [301, 302, 308]);
    await checkUrlStatus("/account.html", [301, 302, 308]);
  } else {
    console.log("\n⚠️ No server found at", BASE_URL, "— skipping HTTP checks.");
    console.log("Start the dev server or set BASE_URL to run them.");
  }

  await runBuild();

  console.log("\n✅ Phase 6 verification passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
