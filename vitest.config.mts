import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
    // Each test file gets its own throwaway in-memory Postgres (PGlite), so
    // tests never touch the local dev database or the live Neon database.
    env: {
      PGLITE_DIR: "memory://",
      BETTER_AUTH_SECRET: "test-only-secret-not-used-anywhere-else",
      BETTER_AUTH_URL: "http://localhost:3000",
    },
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
