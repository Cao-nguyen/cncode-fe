import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cách cũ (deprecated) - xóa nếu có
    // domains: ["example.com"],

    // Cách mới (recommended)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Cho phép tất cả, hoặc thay bằng domain cụ thể
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Nếu dùng Cloudinary
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Avatar Google
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // Avatar GitHub
      },
    ],
  },
  // Các cấu hình khác nếu có
  reactStrictMode: true,
};

export default nextConfig;