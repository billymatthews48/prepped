import { beforeAll, describe, expect, it } from "vitest";
import { migrateTestDb } from "@/test/setup-db";
import { auth } from "./auth";

// "Remember me" (Issue #43). The checkbox decides whether the login cookie
// lasts (it has a Max-Age) or ends when the browser closes (no Max-Age).

const email = "remember@example.com";
const password = "test-password-123";

async function sessionCookie(rememberMe: boolean) {
  const response = await auth.api.signInEmail({ body: { email, password, rememberMe }, asResponse: true });
  const cookies = response.headers.getSetCookie();
  const session = cookies.find((c) => /^[^=]*session_token=/.test(c));
  if (!session) throw new Error(`No session cookie in: ${cookies.join(" | ")}`);
  return session;
}

describe("remember me", () => {
  beforeAll(async () => {
    await migrateTestDb();
    await auth.api.signUpEmail({ body: { name: "Remy", email, password } });
  });

  it("keeps me signed in after the browser closes when it's on", async () => {
    expect(await sessionCookie(true)).toMatch(/Max-Age=\d+/i);
  });

  it("signs me out when the browser closes when it's off", async () => {
    expect(await sessionCookie(false)).not.toMatch(/Max-Age=/i);
  });
});
