# Prompt log: Feature 6, stars

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #17:

> As a user, I want to star my go-to meals and see them in a "Starred" view, so that I can log my regulars faster.

## What the agent built

- `src/lib/stars.ts`: star / un-star, starred ids, and starred meals, using the **single `stars` junction table** from Feature 2 (one row per user + meal)
- Starring checks the meal belongs to you first, so you can't star someone else's meal by id
- A ☆ / ★ button on every meal card and on the meal's page. It flips instantly ("optimistic" update) while the server saves.
- `/starred` page and a "★ Starred" nav link
- A shared `MealCard` component used by Meals and Starred

## Checked in the browser (local)

1. ☆ on Turkey chili → turns ★, and the meal appears on `/starred` (screenshot `docs/evidence/starred-view.jpg`)
2. ★ on the Starred page → meal removed, and the "No starred meals yet" state shows

## Decisions the agent made

- The star sits **next to** the meal link, not inside it, because a button inside a link is invalid HTML and can open the meal by accident.
- Starred is ordered by most recently starred.
