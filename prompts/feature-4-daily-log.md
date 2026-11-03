# Prompt log: Feature 4, daily log

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #13:

> As a user, I want to log servings of a meal to a date (default today), see today's entries with a calorie and protein total, and remove an entry I logged by mistake, so that I know what I've eaten today.

## What the agent built

- **Today page** (`/today`): big calorie and protein totals, a "Log a meal" form (meal dropdown + servings, default 1), and the day's entries grouped by breakfast / lunch / dinner / snack, each with a × to remove it
- ← / → to step through days (`/today?date=YYYY-MM-DD`), plus "Back to today"
- On each meal's page: a **"Log 1 serving today"** button and a **"Logged N times"** history
- `src/lib/log.ts`: log / list / delete, all scoped to the user. **Logging checks the meal belongs to you**, so you can't log someone else's meal by guessing its id.
- Calories and protein per entry are calculated (meal × servings), not stored

## Checked in the browser (local)

1. "Log 1 serving today" on Turkey chili (480 cal, 38 g) → Today shows 480 / 38 g
2. Logged 1.5 servings from the form → 720 cal / 57 g entry, totals 1,200 / 95 g
3. × on the 1.5-serving entry → totals back to 480 / 38 g

## Decisions the agent made

- **"Today" uses my browser's time zone.** The live server runs on UTC, so at 6pm in California it's already "tomorrow" there. A tiny script stores the browser's time zone in a cookie, and the server uses it (falling back to Pacific time).
- **Servings go in steps of 0.25.** Not in the plan.
- **Removing a log entry has no "Are you sure?"** It's a quick undo for a mis-tap. The brief only requires confirmation for deleting an item (a meal).
