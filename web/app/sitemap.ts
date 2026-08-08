import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["/", "/mentorship", "/competitions", "/playbooks", "/guest-lectures", "/login", "/register"];
  return routes.map((route) => ({
    url: `https://embarkindia.in${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
