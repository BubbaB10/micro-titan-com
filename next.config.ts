import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    // permanent: true is a 308 (method preserved). Page source stays in the repo;
    // removing the rule restores the route. Retired offers go to /pricing.
    const retiredToPricing = [
      "/valet",
      "/valet/:path*",
      "/missed-call-ai",
      "/ai-bookkeeper",
      "/ai-estimator",
      "/rescue-social",
      "/review-intel",
      "/car-wash-marketplace",
      "/pivot",
      "/dashboard",
      "/onboarding",
      "/why-provable",
    ];
    return [
      {
        // Was /why-provable. That page now 308s to /pricing; send this here directly.
        source: "/how-it-works",
        destination: "/pricing",
        permanent: false,
      },
      {
        // /portfolio and /portfolio/<slug> — portfolio folded into /about (2026-08-08).
        // :slug* catches zero-or-more segments so this covers both /portfolio and /portfolio/anything.
        source: "/portfolio/:slug*",
        destination: "/about",
        permanent: true,
      },
      {
        // Formerly 308 to /valet. Valet is retired; do not chain through it.
        source: "/aver",
        destination: "/pricing",
        permanent: true,
      },
      {
        // Formerly 308 to /valet. Valet is retired; do not chain through it.
        source: "/proof",
        destination: "/pricing",
        permanent: true,
      },
      ...retiredToPricing.map((source) => ({
        source,
        destination: "/pricing",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
