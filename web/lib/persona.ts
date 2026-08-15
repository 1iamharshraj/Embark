import { randomBytes } from "crypto";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export async function generateUniqueSlug(
  name: string | null | undefined,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(name || "expert") || "expert";
  let slug = `${base}-${randomBytes(3).toString("hex")}`;
  let attempts = 0;
  while (await exists(slug)) {
    slug = `${base}-${randomBytes(4).toString("hex")}`;
    attempts += 1;
    if (attempts > 10) {
      slug = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }
  return slug;
}
