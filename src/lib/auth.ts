import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Locally BETTER_AUTH_URL is set in .env.local. On Vercel we fall back to the
// production domain Vercel provides, so no extra setting is needed there.
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? productionUrl,
  trustedOrigins: productionUrl ? [productionUrl] : [],
  database: drizzleAdapter(db, { provider: "pg", usePlural: true, schema }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  // nextCookies lets server actions set the login cookie. It must stay last.
  plugins: [nextCookies()],
});
