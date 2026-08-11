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
  // Auth & RBAC
  "prisma/schema.prisma",
  "lib/authOptions.ts",
  "types/next-auth.d.ts",
  "lib/rbac.ts",
  "middleware.ts",
  "app/api/v1/auth/refresh/route.ts",
  // RBAC admin API
  "app/api/admin/roles/route.ts",
  "app/api/admin/roles/[id]/route.ts",
  "app/api/admin/permissions/route.ts",
  "app/api/admin/users/route.ts",
  "app/api/admin/users/[id]/roles/route.ts",
  // RBAC admin UI
  "app/admin/roles/page.tsx",
  "app/admin/roles/new/page.tsx",
  "app/admin/roles/[id]/edit/page.tsx",
  "app/admin/roles/_components/RoleForm.tsx",
  "app/admin/permissions/page.tsx",
  "app/admin/users/page.tsx",
  "app/admin/users/_components/UserRoleAssign.tsx",
  // Migrated admin API routes
  "app/api/admin/competitions/route.ts",
  "app/api/admin/competitions/[id]/route.ts",
  "app/api/admin/orders/route.ts",
  "app/api/admin/orders/[id]/route.ts",
  "app/api/admin/mentorship/[id]/route.ts",
  "app/api/admin/lecture-requests/[id]/route.ts",
  "app/api/admin/speaker-applications/[id]/route.ts",
  "app/api/admin/notifications/route.ts",
];

function checkContent(rel: string, needle: string) {
  checkFile(rel);
  const content = fs.readFileSync(path.join(webRoot, rel), "utf8");
  if (!content.includes(needle)) fail(`${rel} missing expected content: ${needle}`);
}

function main() {
  for (const file of expectedFiles) {
    checkFile(file);
  }

  // Sanity checks for RBAC wiring
  checkContent("lib/rbac.ts", "requireAuth");
  checkContent("lib/rbac.ts", "requirePermission");
  checkContent("lib/rbac.ts", "checkPagePermission");
  checkContent("lib/authOptions.ts", "PrismaAdapter");
  checkContent("lib/authOptions.ts", "GoogleProvider");
  checkContent("lib/authOptions.ts", "roles");
  checkContent("lib/authOptions.ts", "permissions");
  checkContent("middleware.ts", "/admin/:path*");
  checkContent("middleware.ts", "/expert/:path*");
  checkContent("middleware.ts", "/judge/:path*");

  console.log("✅ Phase 1 verification passed.");
  console.log("   Files present for Identity, RBAC, refresh tokens, middleware and admin role UI.");
}

main();
