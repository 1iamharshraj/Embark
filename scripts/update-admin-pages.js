const fs = require("fs");
const path = require("path");

const pages = [
  { file: "web/app/admin/page.tsx", perm: "dashboard.view" },
  { file: "web/app/admin/playbooks/page.tsx", perm: "dashboard.view" },
  { file: "web/app/admin/mentors/page.tsx", perm: "expert.view" },
  { file: "web/app/admin/speakers/page.tsx", perm: "speaker.view" },
  { file: "web/app/admin/speaker-applications/page.tsx", perm: "speaker.view" },
  { file: "web/app/admin/lectures/page.tsx", perm: "lecture.view" },
  { file: "web/app/admin/lecture-requests/page.tsx", perm: "lecture.view" },
  { file: "web/app/admin/mentorship/page.tsx", perm: "mentorship.view" },
  { file: "web/app/admin/orders/page.tsx", perm: "order.view" },
  { file: "web/app/admin/competitions/page.tsx", perm: "competition.view" },
  { file: "web/app/admin/competitions/new/page.tsx", perm: "competition.create" },
  { file: "web/app/admin/competitions/[id]/edit/page.tsx", perm: "competition.update" },
  { file: "web/app/admin/competitions/[id]/registrations/page.tsx", perm: "competition.view" },
  { file: "web/app/admin/competitions/[id]/progress/page.tsx", perm: "competition.view" },
  { file: "web/app/admin/competitions/[id]/results/page.tsx", perm: "competition.view" },
];

for (const { file, perm } of pages) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.log("MISSING", file);
    continue;
  }
  let content = fs.readFileSync(fullPath, "utf8");

  if (!content.includes("checkPagePermission")) {
    content = content.replace(/import\s+\{\s*redirect\s*\}\s+from\s+["']next\/navigation["'];\s*\n/g, "");
    content = content.replace(/import\s+\{\s*getServerSession\s*\}\s+from\s+["']next-auth\/next["'];\s*\n/g, "");
    content = content.replace(/import\s+\{\s*authOptions\s*\}\s+from\s+["']@\/lib\/authOptions["'];\s*\n/g, "");
    content = content.replace(/^(import\s+.*?;\s*\n)/, `$1import { checkPagePermission } from "@/lib/rbac";\n`);
  }

  content = content.replace(
    /const\s+session\s*=\s*await\s+getServerSession\(authOptions\);\s*\n\s*if\s*\(\s*!session\?\.user\?\.isAdmin\s*\)\s*redirect\("\/account"\);/g,
    `await checkPagePermission("${perm}");`
  );

  fs.writeFileSync(fullPath, content);
  console.log("UPDATED", file, "->", perm);
}
