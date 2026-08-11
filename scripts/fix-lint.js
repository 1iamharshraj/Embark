const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, files);
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(path.join(process.cwd(), "web"));

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  // Remove unused redirect imports in admin pages where checkPagePermission is used
  if (file.includes("app/admin") && content.includes("checkPagePermission")) {
    const before = content;
    content = content.replace(/import\s+\{\s*redirect\s*\}\s+from\s+["']next\/navigation["'];\s*\n/g, "");
    if (content !== before) changed = true;
  }

  // Replace catch (error: any) with catch (error) and fix error.message checks
  if (content.includes("catch (error: any)")) {
    content = content.replace(/catch\s*\(\s*error\s*:\s*any\s*\)\s*\{/g, "catch (error) {");
    // Replace error.message checks with instanceof checks in catch blocks
    content = content.replace(
      /if\s*\(\s*error\.message\s*===\s*["']UNAUTHORIZED["']\s*\)/g,
      'if (error instanceof Error && error.message === "UNAUTHORIZED")'
    );
    content = content.replace(
      /if\s*\(\s*error\.message\s*===\s*["']FORBIDDEN["']\s*\)/g,
      'if (error instanceof Error && error.message === "FORBIDDEN")'
    );
    // Replace error.message in error response
    content = content.replace(
      /data\.error\s*\|\|\s*error\.message\s*\|\|\s*["']Failed/g,
      'data.error || (error instanceof Error ? error.message : "Failed'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log("FIXED", file);
  }
}
