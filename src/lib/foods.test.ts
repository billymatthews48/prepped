import { beforeAll, describe, expect, it } from "vitest";
import { migrateTestDb, signUpAndLogIn } from "@/test/setup-db";
import { addFoodToMyMeals, getFood, listLibraryFoods, restoreLibraryValues } from "./foods";
import { listEntriesForDay, logMeal } from "./log";
import { createMeal, listMeals, updateMeal } from "./meals";

// Stranger-test fix (Issue #37): a new account starts with a food library
// instead of an empty meal list.

describe("food library", () => {
  let ada: string;
  let ben: string;

  beforeAll(async () => {
    await migrateTestDb();
    ada = (await signUpAndLogIn("Ada", "ada-foods@example.com")).id;
    ben = (await signUpAndLogIn("Ben", "ben-foods@example.com")).id;
  });

  const libraryFood = async (userId: string, name: string) =>
    (await listLibraryFoods(userId)).find((f) => f.name === name);

  it("gives a brand-new account 100+ foods to pick from", async () => {
    const library = await listLibraryFoods(ada);
    expect(library.length).toBeGreaterThanOrEqual(100);
    expect(await libraryFood(ada, "Banana")).toMatchObject({ serving: "1 medium", calories: 105, proteinG: 1 });
  });

  it("logging a library food with adjusted numbers saves it to my meals only", async () => {
    const banana = (await libraryFood(ada, "Banana"))!;
    const meal = await addFoodToMyMeals(ada, banana.id, { calories: 120, proteinG: 1.5 });
    expect(meal).toMatchObject({ userId: ada, foodId: banana.id, name: "Banana", slot: "snack", calories: 120 });
    await logMeal(ada, { mealId: meal!.id, eatenOn: "2026-11-03", servings: 2 });
    expect((await listEntriesForDay(ada, "2026-11-03")).map((e) => e.calories)).toEqual([240]);

    // The shared library row is unchanged, and Banana leaves Ada's library list
    expect(await getFood(banana.id)).toMatchObject({ calories: 105, proteinG: 1 });
    expect(await libraryFood(ada, "Banana")).toBeUndefined();

    // Ben still has Banana in his library and no meals of his own
    expect(await libraryFood(ben, "Banana")).toBeDefined();
    expect(await listMeals(ben)).toEqual([]);
  });

  it("adding the same food twice reuses my meal instead of making a copy", async () => {
    const egg = (await libraryFood(ada, "Hard-boiled egg"))!;
    const first = await addFoodToMyMeals(ada, egg.id, { calories: 78, proteinG: 6 });
    const second = await addFoodToMyMeals(ada, egg.id, { calories: 78, proteinG: 6 });
    expect(second!.id).toBe(first!.id);
  });

  it("restores the library numbers after a bad edit, and only on my own meal", async () => {
    const apple = (await libraryFood(ada, "Apple"))!;
    const meal = (await addFoodToMyMeals(ada, apple.id, { calories: 95, proteinG: 0.5 }))!;
    await updateMeal(ada, meal.id, { name: "Apple", slot: "snack", calories: 950, proteinG: 0.5, notes: null });

    expect(await restoreLibraryValues(ben, meal.id)).toBeNull(); // not Ben's meal
    expect(await restoreLibraryValues(ada, meal.id)).toMatchObject({ calories: 95, proteinG: 0.5 });
  });

  it("has nothing to restore on a meal I made myself, and hides library foods I already have by name", async () => {
    const mine = await createMeal(ada, {
      name: "grilled chicken breast",
      slot: "dinner",
      calories: 300,
      proteinG: 50,
      notes: null,
    });
    expect(await restoreLibraryValues(ada, mine.id)).toBeNull();
    expect(await libraryFood(ada, "Grilled chicken breast")).toBeUndefined();
    expect(await libraryFood(ben, "Grilled chicken breast")).toBeDefined();
  });
});
