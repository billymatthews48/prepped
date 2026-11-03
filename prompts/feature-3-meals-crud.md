# Prompt log: Feature 3, meals (create / read / update / delete)

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #9:

> As a user, I want to add a meal with a name, meal slot (breakfast, lunch, dinner, snack), calories per serving, protein per serving, and notes; see my list of meals; open a meal's detail page; edit it; and delete it after an "Are you sure?" confirmation, so that my meal library stays accurate.

## What the agent built

- `/meals`: list of my meals as cards (name, slot, calories, protein), with an empty state that prompts me to add my first meal
- `/meals/new` and `/meals/[id]/edit`: one shared form (name, slot dropdown, calories, protein, notes)
- `/meals/[id]`: detail page with big calorie and protein numbers, notes, and Edit and Delete
- Delete opens an in-page "Are you sure?" dialog that names the meal and warns it also removes every time I logged it. Cancel and Escape close it.
- A friendly "Not found" page for missing meals or ones owned by someone else
- "Meals" added to the nav

## Checked in the browser (local)

1. Added "Chicken & rice bowl", 550 cal, 42 g → landed on its detail page
2. Edited calories to 600 → detail page shows 600
3. Delete → "Are you sure?" dialog → Yes, delete → back to an empty list
4. Visiting the deleted meal's URL → "Not found"

## Decisions the agent made

- **A custom dialog instead of the browser's built-in `confirm()` popup.** It matches the app's look and explains what gets deleted.
- **Validation is light in this PR:** the browser's `required` / `min` checks, plus a generic error if the database rejects the row. Friendly per-field messages are Feature 5, so they get their own PR.
