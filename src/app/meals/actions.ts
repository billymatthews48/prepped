"use server";

import { redirect } from "next/navigation";
import { MEAL_SLOTS, type MealSlot } from "@/db/schema";
import { createMeal, deleteMeal, updateMeal, type MealInput } from "@/lib/meals";
import { requireUser } from "@/lib/session";

export type MealFormValues = {
  name: string;
  slot: string;
  calories: string;
  proteinG: string;
  notes: string;
};

export type MealFormState = {
  error?: string;
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

function toMealInput(values: MealFormValues): MealInput {
  return {
    name: values.name.trim(),
    slot: (MEAL_SLOTS.includes(values.slot as MealSlot) ? values.slot : "lunch") as MealSlot,
    calories: Math.round(Number(values.calories)),
    proteinG: values.proteinG.trim() === "" ? 0 : Number(values.proteinG),
    notes: values.notes.trim() || null,
  };
}

export async function createMealAction(_prev: MealFormState, formData: FormData): Promise<MealFormState> {
  const user = await requireUser();
  const values = readForm(formData);
  let mealId: number;
  try {
    mealId = (await createMeal(user.id, toMealInput(values))).id;
  } catch {
    return { error: "Couldn't save that meal. Check the fields and try again.", values };
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
  let updated;
  try {
    updated = await updateMeal(user.id, mealId, toMealInput(values));
  } catch {
    return { error: "Couldn't save your changes. Check the fields and try again.", values };
  }
  if (!updated) return { error: "That meal no longer exists.", values };
  redirect(`/meals/${mealId}`);
}

export async function deleteMealAction(mealId: number) {
  const user = await requireUser();
  await deleteMeal(user.id, mealId);
  redirect("/meals");
}
