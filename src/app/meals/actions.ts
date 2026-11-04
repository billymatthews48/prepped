"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { restoreLibraryValues } from "@/lib/foods";
import { createMeal, deleteMeal, updateMeal } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { parseMeal, type MealFieldErrors } from "@/lib/validation";

export type MealFormValues = {
  name: string;
  slot: string;
  calories: string;
  proteinG: string;
  notes: string;
};

export type MealFormState = {
  error?: string;
  fieldErrors?: MealFieldErrors;
  values?: MealFormValues;
};

function readForm(formData: FormData): MealFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    slot: String(formData.get("slot") ?? ""),
    calories: String(formData.get("calories") ?? ""),
    proteinG: String(formData.get("proteinG") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createMealAction(_prev: MealFormState, formData: FormData): Promise<MealFormState> {
  const user = await requireUser();
  const values = readForm(formData);
  const parsed = parseMeal(values);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values };

  let mealId: number;
  try {
    mealId = (await createMeal(user.id, parsed.data)).id;
  } catch {
    return { error: "Couldn't save that meal. Please try again.", values };
  }
  redirect(`/meals/${mealId}`);
}

export async function updateMealAction(
  mealId: number,
  _prev: MealFormState,
  formData: FormData,
): Promise<MealFormState> {
  const user = await requireUser();
  const values = readForm(formData);
  const parsed = parseMeal(values);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values };

  let updated;
  try {
    updated = await updateMeal(user.id, mealId, parsed.data);
  } catch {
    return { error: "Couldn't save your changes. Please try again.", values };
  }
  if (!updated) return { error: "That meal no longer exists.", values };
  redirect(`/meals/${mealId}`);
}

/** Puts the food library's calories and protein back on a meal copied from it. */
export async function restoreLibraryAction(mealId: number) {
  const user = await requireUser();
  await restoreLibraryValues(user.id, mealId);
  revalidatePath(`/meals/${mealId}`);
  revalidatePath("/today");
}

export async function deleteMealAction(mealId: number) {
  const user = await requireUser();
  await deleteMeal(user.id, mealId);
  redirect("/meals");
}
