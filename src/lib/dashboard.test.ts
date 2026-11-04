import { beforeAll, describe, expect, it } from "vitest";
import { migrateTestDb, signUpAndLogIn } from "@/test/setup-db";
import { getDashboard } from "./dashboard";
import { logMeal } from "./log";
import { createMeal } from "./meals";

// PLAN.md section 4, test 2 (dashboard stat):
// Given I logged 2,000 calories on Monday and 2,400 on Tuesday (including one
// entry of 1.5 servings) and nothing on Wednesday, when the dashboard
// calculates average daily calories, then it shows 2,200, because it averages
// only the days I logged.

describe("dashboard: average daily calories", () => {
  beforeAll(migrateTestDb);

  it("averages only the days I logged, counting servings", async () => {
    const me = await signUpAndLogIn("Dash", "dash@example.com");
    const bowl = await createMeal(me.id, { name: "Chicken & rice", slot: "lunch", calories: 800, proteinG: 50, notes: null });
    const chili = await createMeal(me.id, { name: "Turkey chili", slot: "dinner", calories: 1200, proteinG: 70, notes: null });

    // Monday Nov 2: 2.5 servings x 800 = 2,000
    await logMeal(me.id, { mealId: bowl.id, eatenOn: "2026-11-02", servings: 2.5 });
    // Tuesday Nov 3: 1.5 servings x 800 = 1,200, plus 1 x 1,200 = 2,400
    await logMeal(me.id, { mealId: bowl.id, eatenOn: "2026-11-03", servings: 1.5 });
    await logMeal(me.id, { mealId: chili.id, eatenOn: "2026-11-03", servings: 1 });
    // Wednesday Nov 4: nothing logged

    const dashboard = await getDashboard(me.id, "2026-11-04", 2200);

    expect(dashboard.days.find((d) => d.day === "2026-11-02")?.calories).toBe(2000);
    expect(dashboard.days.find((d) => d.day === "2026-11-03")?.calories).toBe(2400);
    expect(dashboard.stats.daysLogged).toBe(2);
    expect(dashboard.stats.avgDailyCalories).toBe(2200);
  });
});
