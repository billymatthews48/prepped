import { beforeAll, describe, expect, it } from "vitest";
import { migrateTestDb, signUpAndLogIn } from "@/test/setup-db";
import { createBatch, deleteBatch, listActiveBatches, listBatchesForMeal } from "./batches";
import { deleteEntry, listEntriesForDay, logMeal } from "./log";
import { createMeal } from "./meals";

describe("meal-prep batches", () => {
  let userId: string;
  let mealId: number;

  beforeAll(async () => {
    await migrateTestDb();
    userId = (await signUpAndLogIn("Prepper", "prep@example.com")).id;
    mealId = (await createMeal(userId, { name: "Chicken & rice", slot: "lunch", calories: 600, proteinG: 45, notes: null })).id;
  });

  const left = async () => (await listBatchesForMeal(userId, mealId)).map((b) => b.servingsLeft);

  it("counts servings left down as I log, and back up when I delete an entry", async () => {
    await createBatch(userId, { mealId, servingsMade: 5, preppedOn: "2026-11-01" });
    expect(await left()).toEqual([5]);

    await logMeal(userId, { mealId, eatenOn: "2026-11-02", servings: 1 });
    const second = await logMeal(userId, { mealId, eatenOn: "2026-11-03", servings: 1.5 });
    expect(await left()).toEqual([2.5]);

    // Logged by mistake: deleting it puts the 1.5 servings back
    await deleteEntry(userId, second!.id);
    expect(await left()).toEqual([4]);
  });

  it("draws from the oldest batch first, then the next one", async () => {
    // Batch 1 has 4 left from the test above; add a newer batch of 3
    await createBatch(userId, { mealId, servingsMade: 3, preppedOn: "2026-11-03" });
    await logMeal(userId, { mealId, eatenOn: "2026-11-03", servings: 4 }); // finishes the old batch
    await logMeal(userId, { mealId, eatenOn: "2026-11-04", servings: 1 }); // comes from the new one

    const active = await listActiveBatches(userId);
    expect(active.map((b) => [b.preppedOn, b.servingsLeft])).toEqual([["2026-11-03", 2]]);

    const entries = await listEntriesForDay(userId, "2026-11-04");
    expect(entries[0].batchPreppedOn).toBe("2026-11-03");
  });

  it("keeps my log entries when a batch is removed", async () => {
    const [newest] = await listBatchesForMeal(userId, mealId);
    await deleteBatch(userId, newest.id);
    const entries = await listEntriesForDay(userId, "2026-11-04");
    expect(entries).toHaveLength(1);
    expect(entries[0].batchPreppedOn).toBeNull();
  });
});
