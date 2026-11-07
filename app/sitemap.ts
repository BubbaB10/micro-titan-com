import type { MetadataRoute } from "next";

/**
 * sitemap.xml — added 2026-09-19.
 *
 * **A sitemap must list canonical destinations, never redirects.** Listing a 308 tells a crawler
 * the URL is authoritative when it is not. If a redirect in next.config.ts is ever removed,
 * add the route back HERE — the two files drift silently otherwise.
 *
 * Deliberately absent because they 308 (or 307) elsewhere:
 *   /proof, /aver, /valet, /valet/*     → /pricing
 *   /how-it-works, /why-provable        → /pricing
 *   /pivot, /dashboard, /onboarding     → /pricing
 *   /missed-call-ai, /ai-bookkeeper, /ai-estimator,
 *   /rescue-social, /review-intel, /car-wash-marketplace → /pricing
 *   /portfolio, /portfolio/[slug]       → /about
 */

const BASE = "https://micro-titan.com";

// priority is a hint about RELATIVE importance within this site only — it does not affect ranking
// against anyone else. Ordered roughly by how much we would mind a crawler skipping the page.
const ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/studio", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/receipts", priority: 0.7, changeFrequency: "daily" },
  { path: "/guide", priority: 0.7, changeFrequency: "monthly" },
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
