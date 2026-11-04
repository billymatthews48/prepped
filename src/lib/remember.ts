import "server-only";
import { cookies } from "next/headers";

// "Remember me" fills in the email on the login page next time. Only the
// email is remembered, never the password: saving passwords is the browser's
// or password manager's job. The cookie is httpOnly (page scripts can't read
// it) and only sent to this site.

const REMEMBERED_EMAIL_COOKIE = "prepped_email";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function rememberedEmail(): Promise<string | undefined> {
  return (await cookies()).get(REMEMBERED_EMAIL_COOKIE)?.value;
}

/** Remembers the email after a "Remember me" login, or forgets it if unticked. */
export async function setRememberedEmail(email: string | null): Promise<void> {
  const jar = await cookies();
  if (email === null) {
    jar.delete(REMEMBERED_EMAIL_COOKIE);
    return;
  }
  jar.set(REMEMBERED_EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
}
