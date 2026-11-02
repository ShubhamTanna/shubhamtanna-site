import type { MetadataRoute } from "next";
import { getPagedProjects } from "@/lib/content";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/story", "/work", "/experience", "/about"].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 }));
  const projects = getPagedProjects().map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, changeFrequency: "monthly" as const, priority: p.tier === 1 ? 0.7 : 0.5 }));
  return [...pages, ...projects];
}
