import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
