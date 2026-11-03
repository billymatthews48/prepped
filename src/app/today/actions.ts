"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isIsoDay } from "@/lib/dates";
import { deleteEntry, logMeal } from "@/lib/log";
import { requireUser } from "@/lib/session";
import { today } from "@/lib/today";

export type LogFormState = { error?: string };

export async function logMealAction(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const user = await requireUser();
  const mealId = Number(formData.get("mealId"));
  const servings = Number(formData.get("servings") || 1);
  const rawDay = String(formData.get("eatenOn") ?? "");
  const eatenOn = isIsoDay(rawDay) ? rawDay : await today();

  if (!Number.isInteger(mealId) || mealId <= 0) return { error: "Pick a meal to log." };
  if (!Number.isFinite(servings) || servings <= 0) return { error: "Servings must be more than 0." };

  const entry = await logMeal(user.id, { mealId, eatenOn, servings });
  if (!entry) return { error: "That meal doesn't exist anymore." };

  revalidatePath("/today");
  redirect(`/today?date=${eatenOn}`);
}

export async function deleteEntryAction(entryId: number) {
  const user = await requireUser();
  await deleteEntry(user.id, entryId);
  revalidatePath("/today");
}
