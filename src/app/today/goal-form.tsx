"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui";
import { setGoalAction } from "./actions";

export function GoalEditor({ goal }: { goal: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; saved?: number }, formData: FormData) => {
      const result = await setGoalAction(prev, formData);
      if (result.saved) setOpen(false);
      return result;
    },
    {},
  );

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-accent hover:underline">
        Edit goal
      </button>
    );
  }

  return (
    <form action={formAction} noValidate className="mt-3 flex flex-col gap-2">
      <label htmlFor="goal-input" className="text-sm font-medium">
        Daily calorie goal
      </label>
      <div className="flex gap-2">
        <input
          id="goal-input"
          name="goal"
          type="number"
          inputMode="numeric"
          defaultValue={goal}
          autoFocus
          aria-invalid={state.error ? true : undefined}
          className={`w-32 rounded-xl border bg-surface px-3 py-2 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft ${
            state.error ? "border-danger" : "border-border"
          }`}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
