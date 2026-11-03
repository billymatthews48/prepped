import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";
import { formatDay } from "@/lib/dates";
import { SLOT_LABELS, formatCalories, formatGrams } from "@/lib/format";
import { listEntriesForMeal } from "@/lib/log";
import { getMeal } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { starredMealIds } from "@/lib/stars";
import { StarButton } from "@/components/star-button";
import { deleteMealAction } from "../actions";
import { DeleteMealButton } from "./delete-button";
import { QuickLogButton } from "./quick-log";

export const metadata: Metadata = { title: "Meal · Prepped" };

export default async function MealPage({ params }: PageProps<"/meals/[id]">) {
  const user = await requireUser();
  const mealId = Number((await params).id);
  const meal = Number.isInteger(mealId) ? await getMeal(user.id, mealId) : null;
  if (!meal) notFound();
  const [history, starredIds] = await Promise.all([
    listEntriesForMeal(user.id, meal.id),
    starredMealIds(user.id),
  ]);
  const starred = starredIds.has(meal.id);

  return (
    <>
      <Link href="/meals" className="mb-4 inline-block text-sm font-medium text-muted hover:text-foreground">
        ← All meals
      </Link>
      <Card>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-medium text-accent">{SLOT_LABELS[meal.slot]}</p>
            <h1 className="text-2xl font-bold tracking-tight">{meal.name}</h1>
          </div>
          <StarButton mealId={meal.id} mealName={meal.name} starred={starred} size="lg" />
        </div>

        <dl className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background p-4">
            <dt className="text-sm text-muted">Calories / serving</dt>
            <dd className="text-2xl font-bold tabular-nums">{formatCalories(meal.calories)}</dd>
          </div>
          <div className="rounded-xl bg-background p-4">
            <dt className="text-sm text-muted">Protein / serving</dt>
            <dd className="text-2xl font-bold tabular-nums">{formatGrams(meal.proteinG)} g</dd>
          </div>
        </dl>

        {meal.notes && <p className="mb-5 whitespace-pre-wrap text-sm">{meal.notes}</p>}

        <div className="flex flex-wrap gap-3">
          <QuickLogButton mealId={meal.id} />
          <ButtonLink href={`/meals/${meal.id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <DeleteMealButton mealName={meal.name} action={deleteMealAction.bind(null, meal.id)} />
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 font-semibold">
          Logged {history.length} time{history.length === 1 ? "" : "s"}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted">You haven&apos;t logged this meal yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/today?date=${entry.eatenOn}`} className="hover:underline">
                  {formatDay(entry.eatenOn)}
                </Link>
                <span className="tabular-nums text-muted">
                  {entry.servings} × · {formatCalories(entry.calories)} cal
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
