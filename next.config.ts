import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.scdn.co" },
      { hostname: "scannables.scdn.co" },
    ],
  },
};

export default nextConfig;
