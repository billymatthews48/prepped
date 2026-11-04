"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isIsoDay } from "@/lib/dates";
import { parseGoal, setCalorieGoal } from "@/lib/goal";
import { deleteEntry, logMeal } from "@/lib/log";
import { requireUser } from "@/lib/session";
import { today } from "@/lib/today";
import { parseServings } from "@/lib/validation";

export type LogFormState = { error?: string };

export async function logMealAction(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const user = await requireUser();
  const mealId = Number(formData.get("mealId"));
  const rawDay = String(formData.get("eatenOn") ?? "");
  const eatenOn = isIsoDay(rawDay) ? rawDay : await today();

  if (!Number.isInteger(mealId) || mealId <= 0) return { error: "Pick a meal to log." };
  const parsedServings = parseServings(String(formData.get("servings") ?? ""));
  if (!parsedServings.ok) return { error: parsedServings.error };
  const servings = parsedServings.servings;

  const entry = await logMeal(user.id, { mealId, eatenOn, servings });
  if (!entry) return { error: "That meal doesn't exist anymore." };

  revalidatePath("/today");
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
}
