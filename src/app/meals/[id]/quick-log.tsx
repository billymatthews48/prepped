"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { logMealAction } from "@/app/today/actions";

export function QuickLogButton({
  mealId,
  batchId,
  label = "Log 1 serving today",
}: {
  mealId: number;
  batchId?: number;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(logMealAction, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="pick" value={`meal:${mealId}`} />
      <input type="hidden" name="servings" value={1} />
      {batchId !== undefined && <input type="hidden" name="batchId" value={batchId} />}
      <Button type="submit" disabled={pending}>
        {pending ? "Logging…" : label}
      </Button>
      {state.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
