"use server";

import { revalidatePath } from "next/cache";
import { createBatch, deleteBatch } from "@/lib/batches";
import { isIsoDay } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { today } from "@/lib/today";

export type BatchFormState = { error?: string; ok?: boolean };

export async function createBatchAction(
  mealId: number,
  _prev: BatchFormState,
  formData: FormData,
): Promise<BatchFormState> {
  const user = await requireUser();
  const raw = String(formData.get("servingsMade") ?? "").trim();
  const servingsMade = Number(raw);
  if (raw === "") return { error: "How many servings did you make?" };
  if (!Number.isFinite(servingsMade) || servingsMade <= 0) return { error: "Servings made must be more than 0." };
  if (servingsMade > 50) return { error: "That's more than 50 servings. Double-check it." };

  const rawDay = String(formData.get("preppedOn") ?? "");
  const preppedOn = isIsoDay(rawDay) ? rawDay : await today();

  const batch = await createBatch(user.id, { mealId, servingsMade, preppedOn });
  if (!batch) return { error: "That meal no longer exists." };

  revalidatePath(`/meals/${mealId}`);
  revalidatePath("/fridge");
  return { ok: true };
}

export async function deleteBatchAction(batchId: number, mealId: number) {
  const user = await requireUser();
  await deleteBatch(user.id, batchId);
  revalidatePath(`/meals/${mealId}`);
  revalidatePath("/fridge");
}
