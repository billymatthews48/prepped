import { beforeAll, describe, expect, it } from "vitest";
import { migrateTestDb, signUpAndLogIn } from "@/test/setup-db";
import { createMeal, getMeal, listMeals } from "./meals";

// PLAN.md section 4, test 1 (data isolation):
// Given User A has a meal "Chicken & rice" and User B is a brand-new account,
// when User B loads their meal list and tries to open User A's meal by its id,
// then User B's list is empty and the meal page says "not found".

describe("data isolation", () => {
  beforeAll(migrateTestDb);

  it("User B cannot see User A's meals", async () => {
    // Given: User A signs up and adds a meal
    const userA = await signUpAndLogIn("User A", "a@example.com");
    const mealA = await createMeal(userA.id, {
      name: "Chicken & rice",
      slot: "lunch",
      calories: 550,
      proteinG: 42,
      notes: null,
    });
    expect(await listMeals(userA.id)).toHaveLength(1);

    // ...and User B is a brand-new account, logged in
    const userB = await signUpAndLogIn("User B", "b@example.com");

    // When: User B loads their meal list and opens User A's meal by its id
    const listForB = await listMeals(userB.id);
    const mealPageForB = await getMeal(userB.id, mealA.id);

    // Then: B's list is empty, and A's meal is "not found" for B
    expect(listForB).toEqual([]);
    expect(mealPageForB).toBeNull();
  });
});
