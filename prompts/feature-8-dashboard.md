# Prompt log: Feature 8, dashboard (+ test 2, dashboard stat)

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #21:

> As a user, I want a bar chart of calories per day for the last 14 days with my goal marked, plus summary stats (average daily calories, average daily protein, days I hit my goal, most-logged meal), so that I can see my trends at a glance.

And PLAN.md test 2:

> Given I logged 2,000 calories on Monday and 2,400 on Tuesday (including one entry of 1.5 servings) and nothing on Wednesday, when the dashboard calculates average daily calories, then it shows 2,200, because it averages only the days I logged.

## What the agent built

- `/dashboard`: four stat tiles (avg daily calories, avg daily protein, days on goal, most-logged meal) and a Recharts bar chart of the last 14 days, with a dashed goal line. Bars are green at or under the goal and amber over it.
- `src/lib/stats.ts`: the averaging math as a plain function with no database, so it's easy to test and explain
- `src/lib/dashboard.ts`: totals per day from the database (meal calories × servings), with zero-filled empty days and the most-logged meal
- `src/lib/dashboard.test.ts`: the PLAN.md test 2 scenario, run through the real database code

## Red, then green

The agent temporarily made the average divide by **all 14 days** instead of only logged days (commit "TEMP: average over all 14 days…"). The test went red with `expected 314 to be 2200` (4,400 ÷ 14 = 314). Restoring `logged.length` turned it green. Screenshots: `docs/evidence/test-dashboard-red.jpg` and `test-dashboard-green.jpg`.

## Checked in the browser (local test data)

4 logged days: 1,300 / 2,290 / 975 / 820 → "1,346 over 4 logged days", "3 / 4 days on goal". Nov 1 (2,290) is amber. Screenshot: `docs/evidence/dashboard-local.jpg`.

## Things that looked wrong but weren't

The first screenshot showed tiny bars against a 2,400 axis. A second screenshot showed full bars: it was caught mid "grow-in" animation. The agent shortened the animation to 0.5 s.

## Decisions the agent made

- **"Days on goal" means at or under the goal.** PLAN.md said "days I hit my goal" without defining it. The agent chose "at or under", which fits cutting. Flagged here because it's a definition I should own.
- **Stats cover the same 14 days as the chart**, not all-time.
- **The goal is fixed at 2,200 for now.** Feature 9 makes it my own setting.
