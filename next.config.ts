import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 站群 SEO 关键：所有页面静态生成，加速首屏 + 利于索引
  output: "export",
  // 禁用图片优化以适配纯静态导出（用 <img> 即可）
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
