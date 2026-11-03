import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { signUpAction } from "../actions";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign up · Prepped" };

export default async function SignUpPage() {
  if (await getUser()) redirect("/today");
  return <AuthForm mode="signup" action={signUpAction} />;
}
