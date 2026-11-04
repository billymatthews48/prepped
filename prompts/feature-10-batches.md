# Prompt log: Feature 10 (my feature #2), meal-prep batches

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #25:

> As a user, I want to record a prep batch ("Sunday: chicken & rice, 5 servings") and have servings left count down as I log from it, so that I know what's still in the fridge.

PLAN.md section 7 named this as the feature I was **least sure** about: "Servings left has to stay right when I edit or delete a log entry, and the app has to know which batch a serving came from."

## What the agent built

- `batches` table and `log_entries.batch_id` (migration `drizzle/0003_batches.sql`), matching PLAN.md section 3
- **Servings left is calculated, never stored:** servings made − servings logged from that batch. Deleting a log entry automatically puts its servings back. This is how the agent handled the PLAN.md risk.
- **Logging draws from the oldest batch** of that meal that still has servings left (first in, first out). The Fridge page's "Eat 1 serving" logs from that specific batch.
- **Meal page:** a "Meal-prep batches" card to record a batch (servings made + date) and see each batch's "N of M left" meter, with Remove
- **`/fridge` ("In the fridge"):** every batch with servings left across all meals, oldest first, with "Eat 1 serving"
- **Today:** entries say "from Tue, Nov 3 prep"
- Removing a batch keeps the log entries (I still ate it); they just stop pointing at the batch
- `src/lib/batches.test.ts`: 3 automated checks (countdown + delete restores, oldest batch first, removing a batch keeps entries). 29 tests total.

## Checked in the browser (local)

Added a 5-serving batch of Chicken & rice bowl → "Log 1 serving today" → Today shows "1 serving · from Tue, Nov 3 prep" → Fridge shows "4 of 5 left".

## Decisions the agent made (worth owning)

- **Oldest-first is automatic.** I don't pick a batch when logging from the Today page. The Fridge page does let me pick one.
- **Servings left can't go below 0.** If I log more than is left, the batch just shows 0 and drops off the Fridge.
- **No "Are you sure?" on removing a batch**, since it doesn't delete anything I ate.
