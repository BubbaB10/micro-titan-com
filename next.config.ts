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
    ];
  },
};

export default nextConfig;
