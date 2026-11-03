import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { meals, type Meal, type MealSlot } from "@/db/schema";

export type MealInput = {
  name: string;
  slot: MealSlot;
  calories: number;
  proteinG: number;
  notes: string | null;
};

// Every function takes the signed-in user's id and filters on it. A meal id on
// its own is never enough to read or change a row.

export async function listMeals(userId: string): Promise<Meal[]> {
  return db
    .select()
    .from(meals)
    // TEMPORARY BREAK for the red screenshot: user filter removed
    .orderBy(desc(meals.createdAt), desc(meals.id));
}

export async function getMeal(userId: string, mealId: number): Promise<Meal | null> {
  const [meal] = await db
    .select()
    .from(meals)
    // TEMPORARY BREAK for the red screenshot: user filter removed
    .where(eq(meals.id, mealId));
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
