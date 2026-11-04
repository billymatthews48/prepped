"use client";

import { startTransition, useActionState, useState } from "react";
import { Button, FormError } from "@/components/ui";
import { MEAL_SLOTS, type MealSlot } from "@/db/schema";
import { SLOT_LABELS } from "@/lib/format";
import { logMealAction } from "./actions";

type MealOption = { id: number; name: string; slot: MealSlot; calories: number; proteinG: number };
type FoodOption = MealOption & { serving: string };

const inputClass =
  "rounded-xl border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft";

/**
 * One dropdown with my meals first, then the food library grouped by slot.
 * Picking a library food shows its numbers in editable fields, with a Revert
 * button once they've been changed. Logging it saves it to my meals.
 */
export function LogForm({ meals, foods, day }: { meals: MealOption[]; foods: FoodOption[]; day: string }) {
  const [state, formAction, pending] = useActionState(logMealAction, {});
  const [pick, setPick] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");

  const meal = meals.find((m) => `meal:${m.id}` === pick);
  const food = foods.find((f) => `food:${f.id}` === pick);
  const edited = food && (Number(calories) !== food.calories || Number(proteinG) !== food.proteinG);

  function choose(value: string) {
    setPick(value);
    const chosen = foods.find((f) => `food:${f.id}` === value);
    if (chosen) revert(chosen);
  }

  function revert(original: FoodOption) {
    setCalories(String(original.calories));
    setProteinG(String(original.proteinG));
  }

  // Submitting through onSubmit (not the form's action prop) stops React from
  // resetting the form after an error, which would put the dropdown back to
  // its first option while the numbers below still showed the picked food.
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <FormError message={state.error} />
      <input type="hidden" name="eatenOn" value={day} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="log-meal" className="text-sm font-medium">
          Meal
        </label>
        <select
          id="log-meal"
          name="pick"
          value={pick}
          onChange={(e) => choose(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Choose a meal or food…
          </option>
          {meals.length > 0 && (
            <optgroup label="My meals">
              {meals.map((m) => (
                <option key={m.id} value={`meal:${m.id}`}>
                  {m.name} · {m.calories} cal
                </option>
              ))}
            </optgroup>
          )}
          {MEAL_SLOTS.map((slot) => {
            const inSlot = foods.filter((f) => f.slot === slot);
            if (inSlot.length === 0) return null;
            return (
              <optgroup key={slot} label={`Food library · ${SLOT_LABELS[slot]}`}>
                {inSlot.map((f) => (
                  <option key={f.id} value={`food:${f.id}`}>
                    {f.name} · {f.calories} cal
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {meal && (
        <p className="text-sm text-muted">
          {meal.calories} cal · {meal.proteinG} g protein per serving
        </p>
      )}

      {food && (
        <div className="flex flex-col gap-3 rounded-xl bg-background p-3">
          <p className="text-sm text-muted">
            From the food library. 1 serving = <span className="font-medium text-foreground">{food.serving}</span>.
            Adjust the numbers to match your portion or label.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex w-28 flex-col gap-1.5">
              <label htmlFor="log-calories" className="text-sm font-medium">
                Calories
              </label>
              <input
                id="log-calories"
                name="calories"
                type="number"
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex w-28 flex-col gap-1.5">
              <label htmlFor="log-protein" className="text-sm font-medium">
                Protein (g)
              </label>
              <input
                id="log-protein"
                name="proteinG"
                type="number"
                inputMode="decimal"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
                className={inputClass}
              />
            </div>
            {edited && (
              <button
                type="button"
                onClick={() => revert(food)}
                className="mb-2.5 text-sm font-medium text-accent hover:underline"
              >
                Revert to {food.calories} cal · {food.proteinG} g
              </button>
            )}
          </div>
          <p className="text-xs text-muted">Logging it also saves it to your meals, so it&apos;s one tap next time.</p>
        </div>
      )}

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
