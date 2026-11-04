import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type CurrentUser = { id: string; name: string; email: string; createdAt: Date };

/** The signed-in user, or null for a visitor. */
export async function getUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email, createdAt } = session.user;
  return { id, name, email, createdAt: new Date(createdAt) };
}

/** The signed-in user; visitors are sent to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
