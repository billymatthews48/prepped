"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Card, Field, FormError } from "@/components/ui";
import type { AuthFormState } from "./actions";

type Mode = "signup" | "login";

export function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

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
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          hint={isSignup ? "At least 8 characters." : undefined}
          error={state.fieldErrors?.password}
        />
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
