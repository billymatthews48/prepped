# Prompt log: Test 1, data isolation

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The brief asks for this test, matching PLAN.md section 4:

> Given User A has a meal "Chicken & rice" and User B is a brand-new account, when User B loads their meal list and tries to open User A's meal by its id, then User B's list is empty and the meal page says "not found".

## What the agent built

- `src/lib/data-isolation.test.ts`, the test itself
- `src/test/setup-db.ts`, helpers that build a throwaway in-memory Postgres and sign up / log in real accounts through Better Auth
- `vitest.config.mts`: tests use in-memory PGlite, never the dev or live database

## Red, then green

The brief says to have the agent temporarily break the feature. The agent removed the `user_id` filter from `listMeals` and `getMeal` (commit "TEMP: remove the user filter…"), and the test went red:

> AssertionError: expected [ { id: 1, …(8) } ] to deeply equal []

User B's list contained User A's "Chicken & rice". Restoring the filter turned it green ("The test has passed without any errors"). Screenshots: `docs/evidence/test-isolation-red.jpg` and `docs/evidence/test-isolation-green.jpg`.

## Bug caught along the way

The test runner first failed with "Can't find meta/_journal.json file" when started from the parent folder, because the migrations path was relative to wherever the command ran. The agent changed it to resolve relative to the helper file itself.
