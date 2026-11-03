import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";
import { SLOT_LABELS, formatCalories, formatGrams } from "@/lib/format";
import { getMeal } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { deleteMealAction } from "../actions";
import { DeleteMealButton } from "./delete-button";

export const metadata: Metadata = { title: "Meal · Prepped" };

export default async function MealPage({ params }: PageProps<"/meals/[id]">) {
  const user = await requireUser();
  const mealId = Number((await params).id);
  const meal = Number.isInteger(mealId) ? await getMeal(user.id, mealId) : null;
  if (!meal) notFound();

  return (
    <>
      <Link href="/meals" className="mb-4 inline-block text-sm font-medium text-muted hover:text-foreground">
        ← All meals
      </Link>
      <Card>
        <p className="mb-1 text-sm font-medium text-accent">{SLOT_LABELS[meal.slot]}</p>
        <h1 className="mb-5 text-2xl font-bold tracking-tight">{meal.name}</h1>

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

        <div className="flex gap-3">
          <ButtonLink href={`/meals/${meal.id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <DeleteMealButton mealName={meal.name} action={deleteMealAction.bind(null, meal.id)} />
        </div>
      </Card>
    </>
  );
}
