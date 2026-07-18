import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  outputFileTracingIncludes: {
    "/api/ingest": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
