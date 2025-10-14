import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Permite URLs como photo-find-raw.s3.amazonaws.com
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
        pathname: "/**",
      },
      // Permite URLs com região, ex: photo-find-raw.s3.us-east-1.amazonaws.com
      {
        protocol: "https",
        hostname: "**.s3.*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
