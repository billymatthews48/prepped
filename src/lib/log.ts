import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { batches, logEntries, meals, type MealSlot } from "@/db/schema";
import { ownsBatch, pickBatchForMeal } from "./batches";

export type LoggedEntry = {
  id: number;
  mealId: number;
  mealName: string;
  slot: MealSlot;
  eatenOn: string;
  servings: number;
  calories: number; // for this entry: meal calories x servings
  proteinG: number; // for this entry: meal protein x servings
  batchPreppedOn: string | null; // the prep batch this serving came from, if any
};

const entryColumns = {
  id: logEntries.id,
  mealId: logEntries.mealId,
  mealName: meals.name,
  slot: meals.slot,
  eatenOn: logEntries.eatenOn,
  servings: logEntries.servings,
  mealCalories: meals.calories,
  mealProteinG: meals.proteinG,
  batchPreppedOn: batches.preppedOn,
};

type EntryRow = {
  id: number;
  mealId: number;
  mealName: string;
  slot: MealSlot;
  eatenOn: string;
  servings: number;
  mealCalories: number;
  mealProteinG: number;
  batchPreppedOn: string | null;
};

function toLoggedEntry(row: EntryRow): LoggedEntry {
  return {
    id: row.id,
    mealId: row.mealId,
    mealName: row.mealName,
    slot: row.slot,
    eatenOn: row.eatenOn,
    servings: row.servings,
    calories: row.mealCalories * row.servings,
    proteinG: row.mealProteinG * row.servings,
    batchPreppedOn: row.batchPreppedOn,
  };
}

/**
 * Logs servings of one of the user's own meals. Returns null if the meal
 * doesn't exist or belongs to someone else. Servings come from the given prep
 * batch, or else the oldest batch of that meal with servings left (if any).
 */
export async function logMeal(
  userId: string,
  input: { mealId: number; eatenOn: string; servings: number; batchId?: number },
): Promise<{ id: number } | null> {
  const [meal] = await db
    .select({ id: meals.id })
    .from(meals)
    .where(and(eq(meals.id, input.mealId), eq(meals.userId, userId)));
  if (!meal) return null;

  const batchId =
    input.batchId !== undefined && (await ownsBatch(userId, meal.id, input.batchId))
      ? input.batchId
      : await pickBatchForMeal(userId, meal.id);

  const [entry] = await db
    .insert(logEntries)
    .values({ userId, mealId: meal.id, batchId, eatenOn: input.eatenOn, servings: input.servings })
    .returning({ id: logEntries.id });
  return entry;
}

export async function listEntriesForDay(userId: string, day: string): Promise<LoggedEntry[]> {
  const rows = await db
    .select(entryColumns)
    .from(logEntries)
    .innerJoin(meals, eq(meals.id, logEntries.mealId))
    .leftJoin(batches, eq(batches.id, logEntries.batchId))
    .where(and(eq(logEntries.userId, userId), eq(logEntries.eatenOn, day)))
    .orderBy(asc(logEntries.createdAt), asc(logEntries.id));
  return rows.map(toLoggedEntry);
}

export async function listEntriesForMeal(userId: string, mealId: number): Promise<LoggedEntry[]> {
  const rows = await db
    .select(entryColumns)
    .from(logEntries)
    .innerJoin(meals, eq(meals.id, logEntries.mealId))
    .leftJoin(batches, eq(batches.id, logEntries.batchId))
    .where(and(eq(logEntries.userId, userId), eq(logEntries.mealId, mealId)))
    .orderBy(desc(logEntries.eatenOn), desc(logEntries.id));
  return rows.map(toLoggedEntry);
}

export async function deleteEntry(userId: string, entryId: number): Promise<boolean> {
  const deleted = await db
    .delete(logEntries)
    .where(and(eq(logEntries.id, entryId), eq(logEntries.userId, userId)))
    .returning({ id: logEntries.id });
  return deleted.length > 0;
}

export function totals(entries: LoggedEntry[]) {
  return entries.reduce(
    (sum, e) => ({ calories: sum.calories + e.calories, proteinG: sum.proteinG + e.proteinG }),
    { calories: 0, proteinG: 0 },
  );
}
