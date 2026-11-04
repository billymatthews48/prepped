"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import type { BatchFormState } from "../batch-actions";

const inputClass =
  "rounded-xl border bg-surface px-3 py-2 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft";

export function BatchForm({
  action,
  defaultDay,
}: {
  action: (prev: BatchFormState, formData: FormData) => Promise<BatchFormState>;
  defaultDay: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} noValidate className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-28 flex-col gap-1.5">
          <label htmlFor="batch-servings" className="text-sm font-medium">
            Servings made
          </label>
          <input
            id="batch-servings"
            name="servingsMade"
            type="number"
            inputMode="decimal"
            min={1}
            step={1}
            placeholder="5"
            aria-invalid={state.error ? true : undefined}
            className={`${inputClass} ${state.error ? "border-danger" : "border-border"}`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="batch-day" className="text-sm font-medium">
            Prepped on
          </label>
          <input id="batch-day" name="preppedOn" type="date" defaultValue={defaultDay} className={`${inputClass} border-border`} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add batch"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
