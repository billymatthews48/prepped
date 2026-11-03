"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { setStar } from "@/lib/stars";

export async function setStarAction(mealId: number, starred: boolean) {
  const user = await requireUser();
  await setStar(user.id, mealId, starred);
  revalidatePath("/meals");
  revalidatePath("/starred");
  revalidatePath(`/meals/${mealId}`);
}
