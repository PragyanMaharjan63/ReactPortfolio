import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Runtime data and local secrets must stay outside deployment artifacts.
  outputFileTracingExcludes: { "/*": ["./data/**/*", "./test-results/**/*", "./.env*"] },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@react-three/drei"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        // Assets retain their filenames when rebuilt; allow revalidation.
        source: "/:folder(models|draco|sim|media)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
