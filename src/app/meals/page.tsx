import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { SLOT_LABELS, formatCalories, formatGrams } from "@/lib/format";
import { listMeals } from "@/lib/meals";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Meals · Prepped" };

export default async function MealsPage() {
  const user = await requireUser();
  const meals = await listMeals(user.id);

  return (
    <>
      <PageHeader title="Meals" action={<ButtonLink href="/meals/new">+ New meal</ButtonLink>} />

      {meals.length === 0 ? (
        <Card className="text-center">
          <p className="mb-1 font-semibold">No meals yet</p>
          <p className="mb-4 text-sm text-muted">Add the meals you prep most often, then log them in one tap.</p>
          <ButtonLink href="/meals/new">Add your first meal</ButtonLink>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {meals.map((meal) => (
            <li key={meal.id}>
              <Link
                href={`/meals/${meal.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{meal.name}</p>
                  <p className="text-sm text-muted">{SLOT_LABELS[meal.slot]}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums">{formatCalories(meal.calories)} cal</p>
                  <p className="text-sm text-muted tabular-nums">{formatGrams(meal.proteinG)} g protein</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
