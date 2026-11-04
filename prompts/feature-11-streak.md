# Prompt log: Feature 11 (my feature #3), logging streak

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #27:

> As a user, I want to see how many days in a row I've logged at least one meal, so that I'm motivated to keep logging.

PLAN.md section 7 listed this as the **first thing to cut** if time ran out. It wasn't cut.

## What the agent built

- `src/lib/streak.ts`: pure streak math (current and best) over the days with at least one log entry
- **Today page:** a "🔥 N-day streak" badge next to the date
- **Dashboard:** a "Logging streak" tile with the best streak
- `src/lib/streak.test.ts`: 5 checks (a run ending today, still alive before logging today, reset after a gap while remembering the best, zero cases, across a month boundary). 34 tests total.

## Checked in the browser (local)

Today: "Tue, Nov 3 🔥 1-day streak". Dashboard: "Logging streak 1 day, best: 1 day".

## Decisions the agent made

- **The streak stays alive until the end of today.** If I haven't logged yet today, it counts up to yesterday, so it doesn't read 0 at breakfast. Hovering over the badge explains this.
- A "day" counts if it has **any** entry, no matter how small.
