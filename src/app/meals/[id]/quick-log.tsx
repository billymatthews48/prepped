"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { logMealAction } from "@/app/today/actions";

export function QuickLogButton({ mealId }: { mealId: number }) {
  const [state, formAction, pending] = useActionState(logMealAction, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="mealId" value={mealId} />
      <input type="hidden" name="servings" value={1} />
      <Button type="submit" disabled={pending}>
        {pending ? "Logging…" : "Log 1 serving today"}
      </Button>
      {state.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
