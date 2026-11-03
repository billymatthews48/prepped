import type { Metadata } from "next";
import Link from "next/link";
import { MealCard } from "@/components/meal-card";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { listMeals, parseMealFilters } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { starredMealIds } from "@/lib/stars";
import { FilterBar } from "./filter-bar";

export const metadata: Metadata = { title: "Meals · Prepped" };

export default async function MealsPage({ searchParams }: PageProps<"/meals">) {
  const user = await requireUser();
  const filters = parseMealFilters(await searchParams);
  const filtering = Boolean(filters.search || filters.slot);
  const [meals, starred] = await Promise.all([listMeals(user.id, filters), starredMealIds(user.id)]);

  const noMealsAtAll = meals.length === 0 && !filtering;

  return (
    <>
      <PageHeader title="Meals" action={<ButtonLink href="/meals/new">+ New meal</ButtonLink>} />

      {noMealsAtAll ? (
        <Card className="text-center">
          <p className="mb-1 font-semibold">No meals yet</p>
          <p className="mb-4 text-sm text-muted">Add the meals you prep most often, then log them in one tap.</p>
          <ButtonLink href="/meals/new">Add your first meal</ButtonLink>
        </Card>
      ) : (
        <>
          <FilterBar />
          <p className="mb-3 text-sm text-muted">
            {meals.length} meal{meals.length === 1 ? "" : "s"}
            {filtering && (
              <>
                {" "}
                ·{" "}
                <Link href="/meals" className="font-medium text-accent hover:underline">
                  Clear filters
                </Link>
              </>
            )}
          </p>
          {meals.length === 0 ? (
            <Card className="text-center">
              <p className="font-semibold">No meals match</p>
              <p className="text-sm text-muted">Try a different word or slot.</p>
            </Card>
          ) : (
            <ul className="flex flex-col gap-3">
              {meals.map((meal) => (
                <li key={meal.id}>
                  <MealCard
                    meal={meal}
                    starred={starred.has(meal.id)}
                    extra={meal.timesLogged ? `logged ${meal.timesLogged}×` : undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
