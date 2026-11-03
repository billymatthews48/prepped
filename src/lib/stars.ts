import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { meals, stars, type Meal } from "@/db/schema";

/**
 * Stars or un-stars one of the user's own meals. Returns the new state, or
 * null if the meal doesn't exist or belongs to someone else.
 */
export async function setStar(userId: string, mealId: number, starred: boolean): Promise<boolean | null> {
  const [meal] = await db
    .select({ id: meals.id })
    .from(meals)
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)));
  if (!meal) return null;

  if (starred) {
    await db.insert(stars).values({ userId, mealId }).onConflictDoNothing();
  } else {
    await db.delete(stars).where(and(eq(stars.userId, userId), eq(stars.mealId, mealId)));
  }
  return starred;
}

/** Ids of the meals this user has starred. */
export async function starredMealIds(userId: string): Promise<Set<number>> {
  const rows = await db.select({ mealId: stars.mealId }).from(stars).where(eq(stars.userId, userId));
  return new Set(rows.map((r) => r.mealId));
}

/** The user's starred meals, most recently starred first. */
export async function listStarredMeals(userId: string): Promise<Meal[]> {
  const rows = await db
    .select({ meal: meals })
    .from(stars)
    .innerJoin(meals, and(eq(meals.id, stars.mealId), eq(meals.userId, userId)))
    .where(eq(stars.userId, userId))
    .orderBy(desc(stars.createdAt));
  return rows.map((r) => r.meal);
}
