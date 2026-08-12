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

function checkContent(rel: string, needle: string) {
  checkFile(rel);
  const content = fs.readFileSync(path.join(webRoot, rel), "utf8");
  if (!content.includes(needle)) fail(`${rel} missing expected content: ${needle}`);
}

const expectedFiles = [
  // Base profile
  "app/api/account/profile/route.ts",
  "app/api/uploads/presign/route.ts",
  "app/api/uploads/route.ts",
  "app/account/_components/ProfileForm.tsx",
  "app/account/_components/ImageUpload.tsx",
  // Student profile
  "app/account/profile/page.tsx",
  "app/account/profile/_components/StudentProfileForm.tsx",
  "app/api/v1/students/profile/route.ts",
  // Expert onboarding
  "app/expert/onboarding/page.tsx",
  "app/expert/onboarding/_components/ExpertOnboardingForm.tsx",
  "app/api/v1/experts/profile/route.ts",
  // Expert verification
  "app/expert/verification/page.tsx",
  "app/expert/verification/_components/DocumentUpload.tsx",
  "app/api/v1/expert-verifications/route.ts",
  // Public expert profile
  "app/expert/[id]/page.tsx",
  "app/api/v1/experts/[id]/route.ts",
  // Admin review
  "app/admin/experts/page.tsx",
  "app/admin/experts/[id]/page.tsx",
  "app/admin/experts/[id]/verification/page.tsx",
  "app/admin/experts/[id]/verification/_components/ReviewActions.tsx",
  "app/api/v1/admin/experts/route.ts",
  "app/api/v1/admin/expert-verifications/[id]/route.ts",
  // Notifications
  "lib/notifications.ts",
];

function main() {
  for (const file of expectedFiles) {
    checkFile(file);
  }

  checkContent("app/api/account/profile/route.ts", "studentProfile");
  checkContent("app/api/uploads/presign/route.ts", "putUrl");
  checkContent("app/api/v1/experts/profile/route.ts", "Expert");
  checkContent("app/api/v1/admin/expert-verifications/[id]/route.ts", "expert.verify");
  checkContent("lib/notifications.ts", "notifyExpertVerification");

  console.log("✅ Phase 2 verification passed.");
  console.log("   Files present for profiles, verification, onboarding and admin review.");
}

main();
