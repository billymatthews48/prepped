import Link from "next/link";
import type { Meal } from "@/db/schema";
import { SLOT_LABELS, formatCalories, formatGrams } from "@/lib/format";
import { StarButton } from "./star-button";

export function MealCard({ meal, starred, extra }: { meal: Meal; starred: boolean; extra?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface py-2 pl-2 pr-4 shadow-sm transition-colors hover:border-accent">
      <StarButton mealId={meal.id} mealName={meal.name} starred={starred} />
      <Link href={`/meals/${meal.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-4 py-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{meal.name}</p>
          <p className="text-sm text-muted">
            {SLOT_LABELS[meal.slot]}
            {extra && <span> · {extra}</span>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums">{formatCalories(meal.calories)} cal</p>
          <p className="text-sm tabular-nums text-muted">{formatGrams(meal.proteinG)} g protein</p>
        </div>
      </Link>
    </div>
  );
}
