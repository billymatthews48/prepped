"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Card, Field, FormError } from "@/components/ui";
import type { AuthFormState } from "./actions";

type Mode = "signup" | "login";

export function AuthForm({
  mode,
  action,
  rememberedEmail,
}: {
  mode: Mode;
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  /** Filled in on the login page after a "Remember me" login. */
  rememberedEmail?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";
  const email = state.values?.email ?? rememberedEmail;

  return (
    <Card className="mx-auto w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-5 text-sm text-muted">
        {isSignup ? "Start tracking your meal prep in under a minute." : "Log in to see today's meals."}
      </p>
      <form action={formAction} noValidate className="flex flex-col gap-4">
        <FormError message={state.error} />
        {isSignup && (
          <Field
            label="Name"
            name="name"
            autoComplete="name"
            defaultValue={state.values?.name}
            error={state.fieldErrors?.name}
          />
        )}
        {/* autocomplete="username" + "current-password"/"new-password" is what
            browsers and password managers look for to offer saving and filling. */}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={email}
          error={state.fieldErrors?.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          autoFocus={!isSignup && Boolean(rememberedEmail)}
          hint={isSignup ? "At least 8 characters." : undefined}
          error={state.fieldErrors?.password}
        />
        {!isSignup && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="rememberMe"
              defaultChecked={state.values?.rememberMe ?? true}
              className="h-4 w-4 accent-accent"
            />
            Remember me
            <span className="text-muted">(stay signed in and fill in my email)</span>
          </label>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "One moment…" : isSignup ? "Sign up" : "Log in"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New to Prepped? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-accent hover:underline">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </Card>
  );
}
