import type { NextConfig } from "next";

// Cache Components is off on purpose: every page here reads the signed-in
// user's cookie, and the classic dynamic rendering model keeps that simple.
const nextConfig: NextConfig = {
  // PGlite ships a WebAssembly Postgres; load it from node_modules instead of bundling it.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
