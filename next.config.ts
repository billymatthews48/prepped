import type { NextConfig } from "next";

// Cache Components is off on purpose: every page here reads the signed-in
// user's cookie, and the classic dynamic rendering model keeps that simple.
const nextConfig: NextConfig = {
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
