const fs = require("fs");
const path = require("path");

const files = [
  "web/app/admin/competitions/[id]/progress/page.tsx",
  "web/app/admin/competitions/[id]/registrations/page.tsx",
  "web/app/admin/competitions/[id]/results/page.tsx",
];

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  let content = fs.readFileSync(fullPath, "utf8");
  content = content.replace(/import\s+\{\s*redirect\s*,\s*notFound\s*\}\s+from\s+["']next\/navigation["'];\s*\n/g, 'import { notFound } from "next/navigation";\n');
  fs.writeFileSync(fullPath, content);
  console.log("FIXED", file);
}

// Fix refresh route
const refreshFile = path.join(process.cwd(), "web/app/api/v1/auth/refresh/route.ts");
let refreshContent = fs.readFileSync(refreshFile, "utf8");
refreshContent = refreshContent.replace(/\}\s*catch\s*\(\s*_error\s*\)\s*\{/, "} catch {");
fs.writeFileSync(refreshFile, refreshContent);
console.log("FIXED refresh route");
