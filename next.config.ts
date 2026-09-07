import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/ru" : "",
  assetPrefix: isGitHubPages ? "/ru/" : undefined,
  env: { NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/ru" : "" },
  allowedDevOrigins: ["terminal.local"],
};

export default nextConfig;
