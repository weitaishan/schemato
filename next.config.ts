import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export keeps every converter page fast and easy to host.
  output: "export",
  // Image optimization requires a server; this project deploys as static files.
  images: { unoptimized: true },
  turbopack: {
    root: process.cwd(),
  },
  trailingSlash: false,
};

export default nextConfig;
