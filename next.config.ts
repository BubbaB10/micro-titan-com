import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/how-it-works",
        destination: "/why-provable",
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
        source: "/aver",
        destination: "/valet",
        permanent: true,
      },
      {
        source: "/proof",
        destination: "/valet",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
