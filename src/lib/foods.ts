import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { foods, meals, type Food, type Meal } from "@/db/schema";

// The food library is shared and read-only: nobody's actions change a row in
// `foods`. Picking a food copies it into the signed-in user's own `meals`,
// where it's scoped to them like any other meal.

/**
 * Library foods I haven't added to my meals yet. A food is hidden once I have
 * a meal copied from it, or a meal of my own with the same name, so the
 * dropdown never lists the same thing twice.
 */
export async function listLibraryFoods(userId: string): Promise<Food[]> {
  return db
    .select()
    .from(foods)
    .where(
      sql`not exists (
        select 1 from ${meals}
        where ${meals.userId} = ${userId}
          and (${meals.foodId} = ${foods.id} or lower(${meals.name}) = lower(${foods.name}))
      )`,
    )
    .orderBy(sql`lower(${foods.name})`);
}

export async function getFood(foodId: number): Promise<Food | null> {
  const [food] = await db.select().from(foods).where(eq(foods.id, foodId));
  return food ?? null;
}

export type Macros = { calories: number; proteinG: number };

/**
 * Copies a library food into my meals with the numbers I chose (the library's,
 * or my adjusted ones). If I already added this food, returns that meal.
 * Returns null if the food doesn't exist.
 */
export async function addFoodToMyMeals(userId: string, foodId: number, macros: Macros): Promise<Meal | null> {
  const food = await getFood(foodId);
  if (!food) return null;

  const [existing] = await db
    .select()
    .from(meals)
    .where(and(eq(meals.userId, userId), eq(meals.foodId, foodId)));
  if (existing) return existing;

  const [meal] = await db
    .insert(meals)
    .values({ userId, foodId, name: food.name, slot: food.slot, ...macros, notes: null })
    .returning();
  return meal;
}

/**
 * Puts the library's calories and protein back on one of my meals that came
 * from the library. Returns null if the meal isn't mine or didn't come from
 * the library.
 */
export async function restoreLibraryValues(userId: string, mealId: number): Promise<Meal | null> {
  const [row] = await db
    .select({ food: foods })
    .from(meals)
    .innerJoin(foods, eq(meals.foodId, foods.id))
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)));
  if (!row) return null;

  const [meal] = await db
    .update(meals)
    .set({ calories: row.food.calories, proteinG: row.food.proteinG, updatedAt: new Date() })
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)))
    .returning();
  return meal ?? null;
}
