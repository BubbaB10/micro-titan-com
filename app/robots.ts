import type { MetadataRoute } from "next";

/**
 * robots.txt — added 2026-09-19.
 *
 * Until now https://micro-titan.com/robots.txt returned 404. A missing robots file is not fatal
 * (crawlers assume "allow all"), but it also means nothing points them at a sitemap, and it is the
 * first thing anyone checks when judging whether a site is looked after. Micro Titan is about to
 * sell local search as a service; being unfindable while doing so is not a position we can hold.
 *
 * Deliberately permissive: every route on this site is public marketing. /dashboard and /onboarding
 * look internal from their names but are interactive PRODUCT DEMOS, and /guide is a real content
 * page — all three are worth indexing. The only excluded routes are the two that 308 elsewhere,
 * and those are handled in sitemap.ts rather than here.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://micro-titan.com/sitemap.xml",
    host: "https://micro-titan.com",
  };
}
