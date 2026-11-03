import type { Metadata } from "next";
import { MealCard } from "@/components/meal-card";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { listStarredMeals } from "@/lib/stars";

export const metadata: Metadata = { title: "Starred · Prepped" };

export default async function StarredPage() {
  const user = await requireUser();
  const meals = await listStarredMeals(user.id);

  return (
    <>
      <PageHeader title="Starred" />
      {meals.length === 0 ? (
        <Card className="text-center">
          <p className="mb-1 font-semibold">No starred meals yet</p>
          <p className="mb-4 text-sm text-muted">Tap the ☆ on your go-to meals to keep them here.</p>
          <ButtonLink href="/meals" variant="secondary">
            Go to meals
          </ButtonLink>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {meals.map((meal) => (
            <li key={meal.id}>
              <MealCard meal={meal} starred />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
