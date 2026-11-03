import { beforeAll, describe, expect, it } from "vitest";
import { migrateTestDb, signUpAndLogIn } from "@/test/setup-db";
import { logMeal } from "./log";
import { createMeal, listMeals, parseMealFilters } from "./meals";

describe("find meals: search, filter, sort", () => {
  let userId: string;

  beforeAll(async () => {
    await migrateTestDb();
    userId = (await signUpAndLogIn("Finder", "finder@example.com")).id;
    const oats = await createMeal(userId, { name: "Overnight oats", slot: "breakfast", calories: 400, proteinG: 25, notes: null });
    const chili = await createMeal(userId, { name: "Turkey chili", slot: "dinner", calories: 520, proteinG: 45, notes: null });
    await createMeal(userId, { name: "Chicken & rice", slot: "lunch", calories: 610, proteinG: 50, notes: null });
    // Oats eaten 3 times, chili once, chicken never
    for (const day of ["2026-11-01", "2026-11-02", "2026-11-03"]) {
      await logMeal(userId, { mealId: oats.id, eatenOn: day, servings: 1 });
    }
    await logMeal(userId, { mealId: chili.id, eatenOn: "2026-11-03", servings: 1 });
  });

  const names = async (filters: Parameters<typeof listMeals>[1]) =>
    (await listMeals(userId, filters)).map((m) => m.name);

  it("searches by name, ignoring case", async () => {
    // Newest first: Chicken & rice was added after Turkey chili
    expect(await names({ search: "CHI" })).toEqual(["Chicken & rice", "Turkey chili"]);
  });

  it("filters by slot", async () => {
    expect(await names({ slot: "breakfast" })).toEqual(["Overnight oats"]);
  });

  it("sorts by most calories, most protein, and most logged", async () => {
    expect(await names({ sort: "calories" })).toEqual(["Chicken & rice", "Turkey chili", "Overnight oats"]);
    expect(await names({ sort: "protein" })).toEqual(["Chicken & rice", "Turkey chili", "Overnight oats"]);
    expect(await names({ sort: "logged" })).toEqual(["Overnight oats", "Turkey chili", "Chicken & rice"]);
  });

  it("counts how many times each meal was logged", async () => {
    const counts = Object.fromEntries((await listMeals(userId)).map((m) => [m.name, m.timesLogged]));
    expect(counts).toEqual({ "Overnight oats": 3, "Turkey chili": 1, "Chicken & rice": 0 });
  });

  it("ignores unknown URL values", () => {
    expect(parseMealFilters({ q: "  oats ", slot: "brunch", sort: "hacker" })).toEqual({
      search: "oats",
      slot: undefined,
      sort: undefined,
    });
  });
});
