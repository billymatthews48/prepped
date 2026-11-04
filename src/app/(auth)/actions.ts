"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  values?: { name?: string; email?: string };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(error: APIError): string {
  const code = (error.body as { code?: string } | undefined)?.code;
  switch (code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with that email already exists. Try logging in instead.";
    case "INVALID_EMAIL_OR_PASSWORD":
      return "That email and password don't match. Check them and try again.";
    case "PASSWORD_TOO_SHORT":
      return "Your password needs at least 8 characters.";
    case "INVALID_EMAIL":
      return "That doesn't look like an email address.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please enter your name.";
  if (!email) fieldErrors.email = "Please enter your email.";
  else if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "That doesn't look like an email address.";
  if (password.length < 8) fieldErrors.password = "Your password needs at least 8 characters.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: { name, email } };

  try {
    await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) return { error: friendlyAuthError(error), values: { name, email } };
    throw error;
  }
  // New accounts go to the targets questionnaire first ("Skip for now" goes to Today).
  redirect("/setup");
}

export async function logInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Please enter your email.";
  if (!password) fieldErrors.password = "Please enter your password.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: { email } };

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) return { error: friendlyAuthError(error), values: { email } };
    throw error;
  }
  redirect("/today");
}

export async function logOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
