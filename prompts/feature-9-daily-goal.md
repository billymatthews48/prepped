# Prompt log: Feature 9 (my feature #1), daily goal + progress bar

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #23:

> As a user, I want to set a daily calorie goal and see a progress bar on today's log (e.g. "1,450 / 2,200"), so that I know how much I have left at a glance.

## What the agent built

- `users.daily_calorie_goal` (default 2,200), migration `drizzle/0002_daily_goal.sql`, matching PLAN.md section 3
- **Today page:** "1,300 / 2,200", a progress bar, and "900 left". When over, it turns amber and says "100 over your goal".
- **Edit goal** inline on the Today page, with a friendly message outside 800–6,000 ("Pick a goal between 800 and 6,000 calories.")
- The dashboard's goal line and "days on goal" now use my goal instead of the fixed 2,200
- 6 more automated checks (goal parsing, left / over math). 26 tests total.

## Checked in the browser (local)

- 2 servings × 650 = 1,300 → "1,300 / 2,200", green bar, "900 left" (`docs/evidence/goal-progress.jpg`)
- Goal 500 → "Pick a goal between 800 and 6,000 calories."
- Goal 1,200 → amber, "100 over your goal" (`docs/evidence/goal-over.jpg`)

## Bugs caught along the way

- **The local database broke again on restart**, even after stopping the dev server first. The real cause: stopping the preview force-kills the server, and PGlite's files are left half-written. Since the local database only holds test data, `scripts/migrate.mjs --local` now detects the damage, rebuilds it empty, and logs why. The live app uses Neon, which isn't affected.
- **The bar looked about 65% full when over the goal.** The agent measured it in the browser: it was 100% (694 px of 694 px). The screenshot had caught the width animation mid-way.

## Decisions the agent made

- Goal range 800–6,000. The goal lives on the `users` row, read with its own query rather than through the login library.
