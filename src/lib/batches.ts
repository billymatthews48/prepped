import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { batches, logEntries, meals, type MealSlot } from "@/db/schema";

// "Servings left" is never stored. It's always servings made minus the
// servings logged from the batch, so deleting or changing a log entry can't
// leave it out of date (the PLAN.md risk for this feature).

const servingsUsed = sql<number>`coalesce(sum(${logEntries.servings}), 0)`.mapWith(Number);

export type BatchWithLeft = {
  id: number;
  mealId: number;
  servingsMade: number;
  preppedOn: string;
  servingsLeft: number;
};

export type ActiveBatch = BatchWithLeft & { mealName: string; slot: MealSlot; calories: number };

function withLeft<T extends { servingsMade: number; used: number }>(row: T) {
  const { used, ...rest } = row;
  return { ...rest, servingsLeft: Math.max(0, Math.round((row.servingsMade - used) * 100) / 100) };
}

export async function createBatch(
  userId: string,
  input: { mealId: number; servingsMade: number; preppedOn: string },
): Promise<{ id: number } | null> {
  const [meal] = await db
    .select({ id: meals.id })
    .from(meals)
    .where(and(eq(meals.id, input.mealId), eq(meals.userId, userId)));
  if (!meal) return null;
  const [batch] = await db
    .insert(batches)
    .values({ userId, mealId: meal.id, servingsMade: input.servingsMade, preppedOn: input.preppedOn })
    .returning({ id: batches.id });
  return batch;
}

export async function listBatchesForMeal(userId: string, mealId: number): Promise<BatchWithLeft[]> {
  const rows = await db
    .select({
      id: batches.id,
      mealId: batches.mealId,
      servingsMade: batches.servingsMade,
      preppedOn: batches.preppedOn,
      used: servingsUsed,
    })
    .from(batches)
    .leftJoin(logEntries, eq(logEntries.batchId, batches.id))
    .where(and(eq(batches.userId, userId), eq(batches.mealId, mealId)))
    .groupBy(batches.id)
    .orderBy(desc(batches.preppedOn), desc(batches.id));
  return rows.map(withLeft);
}

/** Batches that still have servings left, oldest first (eat the oldest first). */
export async function listActiveBatches(userId: string): Promise<ActiveBatch[]> {
  const rows = await db
    .select({
      id: batches.id,
      mealId: batches.mealId,
      servingsMade: batches.servingsMade,
      preppedOn: batches.preppedOn,
      mealName: meals.name,
      slot: meals.slot,
      calories: meals.calories,
      used: servingsUsed,
    })
    .from(batches)
    .innerJoin(meals, eq(meals.id, batches.mealId))
    .leftJoin(logEntries, eq(logEntries.batchId, batches.id))
    .where(eq(batches.userId, userId))
    .groupBy(batches.id, meals.id)
    .orderBy(asc(batches.preppedOn), asc(batches.id));
  return rows.map(withLeft).filter((b) => b.servingsLeft > 0);
}

/** The batch a new serving of this meal should come from: the oldest one with servings left. */
export async function pickBatchForMeal(userId: string, mealId: number): Promise<number | null> {
  const active = (await listActiveBatches(userId)).filter((b) => b.mealId === mealId);
  return active[0]?.id ?? null;
}

/** Checks a batch id belongs to this user and meal. */
export async function ownsBatch(userId: string, mealId: number, batchId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: batches.id })
    .from(batches)
    .where(and(eq(batches.id, batchId), eq(batches.userId, userId), eq(batches.mealId, mealId)));
  return Boolean(row);
}

export async function deleteBatch(userId: string, batchId: number): Promise<boolean> {
  const deleted = await db
    .delete(batches)
    .where(and(eq(batches.id, batchId), eq(batches.userId, userId)))
    .returning({ id: batches.id });
  return deleted.length > 0;
}
