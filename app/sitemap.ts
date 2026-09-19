import type { MetadataRoute } from "next";

/**
 * sitemap.xml — added 2026-09-19.
 *
 * https://micro-titan.com/sitemap.xml returned 404 before this. Every route below was confirmed
 * HTTP 200 on the live site the same day, one request each, before being listed.
 *
 * TWO ROUTES ARE DELIBERATELY ABSENT, and this is the part to preserve when editing:
 *   /proof      → 308 to /valet   (next.config.ts redirects)
 *   /portfolio  → 308 to /about   (folded into /about, 2026-08-08)
 * **A sitemap must list canonical destinations, never redirects.** Listing a 308 tells a crawler
 * the URL is authoritative when it is not, and it is the most common way a well-meaning sitemap
 * makes indexing worse than having none. If a redirect is ever removed, add the route back HERE
 * as well — the two files drift silently otherwise.
 *
 * `/portfolio/[slug]` is also absent: it is a dynamic segment behind the same redirect.
 */

const BASE = "https://micro-titan.com";

// priority is a hint about RELATIVE importance within this site only — it does not affect ranking
// against anyone else. Ordered roughly by how much we would mind a crawler skipping the page.
const ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/valet", priority: 0.9, changeFrequency: "weekly" },
  { path: "/studio", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pivot", priority: 0.8, changeFrequency: "monthly" },
  { path: "/why-provable", priority: 0.8, changeFrequency: "monthly" },
  { path: "/receipts", priority: 0.7, changeFrequency: "daily" },
  { path: "/guide", priority: 0.7, changeFrequency: "monthly" },
  { path: "/dashboard", priority: 0.6, changeFrequency: "monthly" },
  { path: "/onboarding", priority: 0.6, changeFrequency: "monthly" },
  // Case studies. Real shipped work, and the pages most likely to answer a specific search.
  { path: "/ai-bookkeeper", priority: 0.5, changeFrequency: "yearly" },
  { path: "/ai-estimator", priority: 0.5, changeFrequency: "yearly" },
  { path: "/car-wash-marketplace", priority: 0.5, changeFrequency: "yearly" },
  { path: "/missed-call-ai", priority: 0.5, changeFrequency: "yearly" },
  { path: "/rescue-social", priority: 0.5, changeFrequency: "yearly" },
  { path: "/review-intel", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
