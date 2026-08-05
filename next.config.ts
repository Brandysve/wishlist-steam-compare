import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shared.fastly.steamstatic.com" },
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "shared.cloudflare.steamstatic.com" },
    ],
  },
};

export default nextConfig;
