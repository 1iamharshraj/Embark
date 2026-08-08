import fs from "node:fs";
import path from "node:path";

const webRoot = process.cwd();

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function exists(rel: string) {
  return fs.existsSync(path.join(webRoot, rel));
}

function checkFile(rel: string) {
  if (!exists(rel)) fail(`Missing file: ${rel}`);
}

const expectedFiles = [
  "app/page.tsx",
  "app/mentorship/page.tsx",
  "app/mentor/[slug]/page.tsx",
  "app/guest-lectures/page.tsx",
  "app/become-a-speaker/page.tsx",
  "app/invite-an-expert/page.tsx",
  "app/playbooks/page.tsx",
  "app/playbook/[slug]/page.tsx",
  "app/competitions/page.tsx",
  "app/competition/[id]/page.tsx",
  "components/Section.tsx",
  "components/FAQ.tsx",
  "components/MentorCard.tsx",
  "components/CompetitionCard.tsx",
  "components/PlaybookCard.tsx",
  "components/MentorshipPageClient.tsx",
  "components/MentorProfileClient.tsx",
  "components/PlaybookDetailClient.tsx",
  "public/manifest.json",
  "public/offline.html",
  "public/icon-192.svg",
  "public/icon-512.svg",
];

const expectedRoutes = [
  "/",
  "/mentorship",
  "/mentor/[slug]",
  "/guest-lectures",
  "/become-a-speaker",
  "/invite-an-expert",
  "/playbooks",
  "/playbook/[slug]",
  "/competitions",
  "/competition/[id]",
];

function main() {
  for (const file of expectedFiles) {
    checkFile(file);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(webRoot, "public/manifest.json"), "utf8")) as {
    icons?: { src: string }[];
  };
  if (!manifest.icons || manifest.icons.length < 2) {
    fail("Manifest should reference at least two icons.");
  }
  for (const icon of manifest.icons) {
    checkFile(`public${icon.src}`);
  }

  console.log("✅ Phase 1 verification passed.");
  console.log("Expected routes present:");
  for (const route of expectedRoutes) {
    console.log(`  • ${route}`);
  }
}

main();
