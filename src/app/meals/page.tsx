import type { Metadata } from "next";
import { MealCard } from "@/components/meal-card";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { listMeals } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { starredMealIds } from "@/lib/stars";

export const metadata: Metadata = { title: "Meals · Prepped" };

export default async function MealsPage() {
  const user = await requireUser();
  const [meals, starred] = await Promise.all([listMeals(user.id), starredMealIds(user.id)]);

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
              <MealCard meal={meal} starred={starred.has(meal.id)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
