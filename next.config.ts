import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Disable source maps to reduce warnings
  productionBrowserSourceMaps: false,
  // Suppress source map warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false; // Disable source maps in dev
    }
    return config;
  },
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    // Suppress source map warnings
    resolveAlias: {},
  },
  // Suppress hydration warnings from browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
