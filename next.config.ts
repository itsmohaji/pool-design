import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath: process.env.GITHUB_PAGES === "true" ? "/pool-design" : "",
  assetPrefix: process.env.GITHUB_PAGES === "true" ? "/pool-design/" : undefined,
  trailingSlash: true,
};

export default nextConfig;
