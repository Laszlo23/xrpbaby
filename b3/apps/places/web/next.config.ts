import type { NextConfig } from "next";
import path from "path";

const empty = path.join(process.cwd(), "src/shims/npm-empty.js");

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@bc/culture-auth", "@bc/bcc-kit"],
  experimental: {
    optimizePackageImports: ["recharts"],
  },
  async redirects() {
    return [
      { source: "/properties", destination: "/marketplace", permanent: true },
      { source: "/properties/:id", destination: "/marketplace/:id", permanent: true },
      { source: "/issuer", destination: "/list", permanent: true },
      { source: "/portfolio", destination: "/dashboard", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/experience",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/properties/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/:path*.webp",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.modules = [
      path.join(process.cwd(), "node_modules"),
      ...(config.resolve.modules ?? ["node_modules"]),
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      /** Optional peer of @bc/culture-auth; Farcaster login not used on Places. */
      "@neynar/react": path.join(process.cwd(), "src/shims/neynar-react.js"),
      /** Optional peer of @privy-io/react-auth; not used in this app. */
      "@farcaster/mini-app-solana": empty,
      porto: empty,
      "porto/internal": empty,
      "@metamask/connect-evm": empty,
      /** Optional peer of @wagmi/core tempo connector; not used in this app. */
      accounts: empty,
    };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
} as NextConfig;

export default nextConfig;
