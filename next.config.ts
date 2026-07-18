import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prisma 7's adapter-based client + the `pg` driver should be loaded
  // from node_modules at runtime rather than bundled by Turbopack.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
