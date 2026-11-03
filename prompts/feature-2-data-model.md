# Prompt log: Feature 2, data model

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #7:

> As a user, I want my meals, logs, and stars saved in a database and tied to my account, so that they're still there next time and nobody else can see them.

## What the agent built

- Tables from PLAN.md section 3: `meals`, `log_entries`, `stars` (migration `drizzle/0001_prepped_data.sql`)
- `stars` is one junction table with primary key `(user_id, meal_id)`. That's "this user starred this meal", one table for everyone.
- Database-level rules: name not blank, calories > 0, protein ≥ 0, slot is one of the four, servings > 0
- `src/lib/meals.ts`: list / get / create / update / delete, where **every function takes the user's id and filters on it**
- `schema.md` in the repo root, with a "Compared with PLAN.md" table

## Decisions the agent made

- **`batches` and `daily_calorie_goal` are not created yet.** They arrive with Features 9 and 10, so each feature's PR holds its own database change.
- **`log_entries` also stores `user_id`**, even though it could be looked up through the meal. That makes "today's log for this user" a simple query, and ownership checks don't depend on a join. PLAN.md already listed it.
- **`protein_g` defaults to 0** rather than being required, so a meal can be saved without knowing its protein.
