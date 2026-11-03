import type { PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { db } from "@/db";
import { auth } from "@/lib/auth";

/** Creates every table in the test file's in-memory database. */
export async function migrateTestDb() {
  await migrate(db as unknown as PgliteDatabase, { migrationsFolder: "drizzle" });
}

/**
 * Signs up a real account through Better Auth, then logs in the same way the
 * login page does, and returns the user id read back from that login session.
 */
export async function signUpAndLogIn(name: string, email: string) {
  const password = "test-password-123";
  await auth.api.signUpEmail({ body: { name, email, password } });

  const login = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
  const cookie = login.headers.get("set-cookie") ?? "";
  const session = await auth.api.getSession({ headers: new Headers({ cookie }) });
  if (!session) throw new Error(`Login failed for ${email}`);
  return session.user;
}
