import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { createMealAction } from "../actions";
import { MealForm } from "../meal-form";

export const metadata: Metadata = { title: "New meal · Prepped" };

export default async function NewMealPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="New meal" />
      <MealForm
        action={createMealAction}
        initial={{ name: "", slot: "lunch", calories: "", proteinG: "", notes: "" }}
        submitLabel="Save meal"
        cancelHref="/meals"
      />
    </>
  );
}
