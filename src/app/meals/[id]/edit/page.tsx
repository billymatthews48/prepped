import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getMeal } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { updateMealAction } from "../../actions";
import { MealForm } from "../../meal-form";

export const metadata: Metadata = { title: "Edit meal · Prepped" };

export default async function EditMealPage({ params }: PageProps<"/meals/[id]/edit">) {
  const user = await requireUser();
  const mealId = Number((await params).id);
  const meal = Number.isInteger(mealId) ? await getMeal(user.id, mealId) : null;
  if (!meal) notFound();

  return (
    <>
      <PageHeader title="Edit meal" />
      <MealForm
        action={updateMealAction.bind(null, meal.id)}
        initial={{
          name: meal.name,
          slot: meal.slot,
          calories: String(meal.calories),
          proteinG: String(meal.proteinG),
          notes: meal.notes ?? "",
        }}
        submitLabel="Save changes"
        cancelHref={`/meals/${meal.id}`}
      />
    </>
  );
}
