import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necessário para acessar o site pelo IP (ex: 192.168.x.x)
  experimental: {
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.25.69:3000",
      "http://192.168.25.71:3000",
      // adicione outros IPs caso acesse de outro dispositivo
    ],
  },

  images: {
    remotePatterns: [
      // S3 sem região
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },

      // S3 com região
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },

      // Caso suas imagens venham do backend local
      {
        protocol: "http",
        hostname: "192.168.25.69", // backend rodando no seu PC
        port: "8000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
