import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { rememberedEmail } from "@/lib/remember";
import { getUser } from "@/lib/session";
import { logInAction } from "../actions";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Log in · Prepped" };

export default async function LogInPage() {
  if (await getUser()) redirect("/today");
  return <AuthForm mode="login" action={logInAction} rememberedEmail={await rememberedEmail()} />;
}
