import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Real photos/logos are dropped into /public later; local assets need no
  // remote patterns. Kept explicit so the config is obvious when assets grow.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
