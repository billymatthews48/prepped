# Prompt log: Feature 7, find things (search, filter, sort)

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #19:

> As a user, I want to search meals by name, filter by meal slot, and sort by newest, most calories, most protein, or most logged, so that I can find a meal quickly as my list grows.

## What the agent built

- A filter bar on `/meals`: a search box (updates as you type, after a short pause), a slot dropdown, and a sort dropdown (Newest / Most calories / Most protein / Most logged)
- Choices are stored in the URL (`/meals?q=chili&slot=dinner&sort=calories`), so refresh and back/forward keep them
- "N meals · Clear filters", plus a "No meals match" state
- Each card shows "logged N×", counted with a join on `log_entries`
- `listMeals` in `src/lib/meals.ts` **always starts with the user filter**. Search and slot only narrow it.
- `src/lib/meals.test.ts`: 5 automated checks for search, slot filter, all three sorts, the logged counts, and ignoring junk URL values

## Checked

- Browser: "zzz" → "0 meals · No meals match". "chili" → only Turkey chili, "logged 1×" (`docs/evidence/search-chili.jpg`)
- All 19 tests pass, including the data isolation test

## Bugs caught along the way

- **Hydration error** in the browser console on the new "★ Starred" nav link. The agent traced it to an old dev server still running from before the link was added, so the page HTML and the browser code disagreed. After a clean restart, the server HTML contained the link and no new errors appeared.
- **Local test database corrupted** ("Aborted()" from PGlite). Cause: the agent ran a migration while the dev server had the same database folder open, and PGlite only supports one process at a time. Since it held only test data, the agent deleted it and recreated it. Lesson: stop the dev server before running anything else against `.pglite/`.

## Decisions the agent made

- Search waits 250 ms after you stop typing instead of searching on every keystroke.
- No "A–Z" sort. PLAN.md listed exactly four sorts.
