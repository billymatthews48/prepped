"use client";

import { useActionState } from "react";
import { Button, FormError } from "@/components/ui";
import { SLOT_LABELS } from "@/lib/format";
import type { MealSlot } from "@/db/schema";
import { logMealAction } from "./actions";

type MealOption = { id: number; name: string; slot: MealSlot; calories: number };

const inputClass =
  "rounded-xl border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft";

export function LogForm({ meals, day }: { meals: MealOption[]; day: string }) {
  const [state, formAction, pending] = useActionState(logMealAction, {});

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      <FormError message={state.error} />
      <input type="hidden" name="eatenOn" value={day} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="log-meal" className="text-sm font-medium">
          Meal
        </label>
        <select id="log-meal" name="mealId" defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose a meal…
          </option>
          {meals.map((meal) => (
            <option key={meal.id} value={meal.id}>
              {meal.name} · {meal.calories} cal ({SLOT_LABELS[meal.slot]})
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-3">
        <div className="flex w-28 flex-col gap-1.5">
          <label htmlFor="log-servings" className="text-sm font-medium">
            Servings
          </label>
          <input
            id="log-servings"
            name="servings"
            type="number"
            inputMode="decimal"
            min={0.25}
            step={0.25}
            defaultValue={1}
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Logging…" : "Log it"}
        </Button>
      </div>
    </form>
  );
}
