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
        // /portfolio/<slug> pages exist but /portfolio itself never did — nav and cards call the
        // index "/proof", so a trimmed URL 404'd. Redirect rather than a second index page.
        source: "/portfolio",
        destination: "/proof",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
