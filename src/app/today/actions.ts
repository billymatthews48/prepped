"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isIsoDay } from "@/lib/dates";
import { addFoodToMyMeals } from "@/lib/foods";
import { parseGoal, setCalorieGoal } from "@/lib/goal";
import { deleteEntry, logMeal } from "@/lib/log";
import { requireUser } from "@/lib/session";
import { today } from "@/lib/today";
import { parseMacros, parseServings } from "@/lib/validation";

export type LogFormState = { error?: string };

/**
 * Logs servings of something picked in the dropdown: "meal:12" is one of my
 * meals, "food:34" is a food from the library. A library food is first copied
 * into my meals with the calories and protein shown in the form (which I may
 * have adjusted), so next time it's one of my meals.
 */
export async function logMealAction(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const user = await requireUser();
  const [kind, rawId] = String(formData.get("pick") ?? "").split(":");
  const pickedId = Number(rawId);
  const rawDay = String(formData.get("eatenOn") ?? "");
  const eatenOn = isIsoDay(rawDay) ? rawDay : await today();

  if ((kind !== "meal" && kind !== "food") || !Number.isInteger(pickedId) || pickedId <= 0) {
    return { error: "Pick a meal to log." };
  }
  const parsedServings = parseServings(String(formData.get("servings") ?? ""));
  if (!parsedServings.ok) return { error: parsedServings.error };
  const servings = parsedServings.servings;

  let mealId = pickedId;
  if (kind === "food") {
    const macros = parseMacros({
      calories: String(formData.get("calories") ?? ""),
      proteinG: String(formData.get("proteinG") ?? ""),
    });
    if (!macros.ok) return { error: macros.error };
    const meal = await addFoodToMyMeals(user.id, pickedId, macros.data);
    if (!meal) return { error: "That food isn't in the library anymore." };
    mealId = meal.id;
    revalidatePath("/meals");
  }

  const rawBatch = Number(formData.get("batchId"));
  const batchId = Number.isInteger(rawBatch) && rawBatch > 0 ? rawBatch : undefined;

  const entry = await logMeal(user.id, { mealId, eatenOn, servings, batchId });
  if (!entry) return { error: "That meal doesn't exist anymore." };

  revalidatePath("/today");
  revalidatePath("/fridge");
  redirect(`/today?date=${eatenOn}`);
}

export async function setGoalAction(
  _prev: { error?: string; saved?: number },
  formData: FormData,
): Promise<{ error?: string; saved?: number }> {
  const user = await requireUser();
  const parsed = parseGoal(String(formData.get("goal") ?? ""));
  if (!parsed.ok) return { error: parsed.error };
  await setCalorieGoal(user.id, parsed.goal);
  revalidatePath("/today");
  revalidatePath("/dashboard");
  return { saved: parsed.goal };
}

export async function deleteEntryAction(entryId: number) {
  const user = await requireUser();
  await deleteEntry(user.id, entryId);
  revalidatePath("/today");
  revalidatePath("/fridge");
}
