"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Card, Field, FormError } from "@/components/ui";
import { MEAL_SLOTS } from "@/db/schema";
import { SLOT_LABELS } from "@/lib/format";
import type { MealFormState, MealFormValues } from "./actions";

export function MealForm({
  action,
  initial,
  submitLabel,
  cancelHref,
}: {
  action: (prev: MealFormState, formData: FormData) => Promise<MealFormState>;
  initial: MealFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initial;
  const errors = state.fieldErrors ?? {};

  return (
    <Card>
      <form action={formAction} noValidate className="flex flex-col gap-4">
        <FormError message={state.error} />
        <Field
          label="Meal name"
          name="name"
          defaultValue={values.name}
          placeholder="Chicken & rice bowl"
          error={errors.name}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="field-slot" className="text-sm font-medium">
            Meal slot
          </label>
          <select
            id="field-slot"
            name="slot"
            defaultValue={values.slot || "lunch"}
            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
          >
            {MEAL_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {SLOT_LABELS[slot]}
              </option>
            ))}
          </select>
          {errors.slot && <p className="text-sm text-danger">{errors.slot}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Calories per serving"
            name="calories"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={values.calories}
            placeholder="550"
            error={errors.calories}
          />
          <Field
            label="Protein per serving (g)"
            name="proteinG"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            defaultValue={values.proteinG}
            placeholder="42"
            error={errors.proteinG}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="field-notes" className="text-sm font-medium">
            Notes <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="field-notes"
            name="notes"
            rows={3}
            defaultValue={values.notes}
            placeholder="Recipe link, sauce, how many it makes…"
            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
          {errors.notes && <p className="text-sm text-danger">{errors.notes}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : submitLabel}
          </Button>
          <Link href={cancelHref} className="inline-flex items-center px-2 text-sm font-medium text-muted hover:text-foreground">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
