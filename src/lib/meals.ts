import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { logEntries, MEAL_SLOTS, meals, type Meal, type MealSlot } from "@/db/schema";
import { MEAL_SORTS, type MealSort } from "./format";

export type MealInput = {
  name: string;
  slot: MealSlot;
  calories: number;
  proteinG: number;
  notes: string | null;
};

// Every function takes the signed-in user's id and filters on it. A meal id on
// its own is never enough to read or change a row.

export type MealFilters = { search?: string; slot?: MealSlot; sort?: MealSort };
export type MealWithCount = Meal & { timesLogged: number };

/** Turns raw URL params into safe filters (unknown values are ignored). */
export function parseMealFilters(params: Record<string, string | string[] | undefined>): MealFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const search = one(params.q)?.trim().slice(0, 80) || undefined;
  const slot = MEAL_SLOTS.find((s) => s === one(params.slot));
  const sortParam = one(params.sort);
  const sort = sortParam && sortParam in MEAL_SORTS ? (sortParam as MealSort) : undefined;
  return { search, slot, sort };
}

export async function listMeals(userId: string, filters: MealFilters = {}): Promise<MealWithCount[]> {
  // The user filter is always first; search and slot only narrow it further.
  const conditions: SQL[] = [eq(meals.userId, userId)];
  if (filters.search) {
    const escaped = filters.search.replace(/[\\%_]/g, (c) => `\\${c}`);
    conditions.push(ilike(meals.name, `%${escaped}%`));
  }
  if (filters.slot) conditions.push(eq(meals.slot, filters.slot));

  const timesLogged = count(logEntries.id);
  const order = {
    newest: [desc(meals.createdAt), desc(meals.id)],
    calories: [desc(meals.calories), asc(meals.name)],
    protein: [desc(meals.proteinG), asc(meals.name)],
    logged: [desc(timesLogged), asc(meals.name)],
  }[filters.sort ?? "newest"];

  const rows = await db
    .select({ meal: meals, timesLogged })
    .from(meals)
    .leftJoin(logEntries, eq(logEntries.mealId, meals.id))
    .where(and(...conditions))
    .groupBy(meals.id)
    .orderBy(...order);
  return rows.map((r) => ({ ...r.meal, timesLogged: Number(r.timesLogged) }));
}

export async function getMeal(userId: string, mealId: number): Promise<Meal | null> {
  const [meal] = await db
    .select()
    .from(meals)
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)));
  return meal ?? null;
}

export async function createMeal(userId: string, input: MealInput): Promise<Meal> {
  const [meal] = await db
    .insert(meals)
    .values({ ...input, userId })
    .returning();
  return meal;
}

export async function updateMeal(userId: string, mealId: number, input: MealInput): Promise<Meal | null> {
  const [meal] = await db
    .update(meals)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)))
    .returning();
  return meal ?? null;
}

export async function deleteMeal(userId: string, mealId: number): Promise<boolean> {
  const deleted = await db
    .delete(meals)
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)))
    .returning({ id: meals.id });
  return deleted.length > 0;
}
