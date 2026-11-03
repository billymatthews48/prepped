# Prompt log: Feature 5, validation

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The user story from Issue #15:

> As a user, if I leave the meal name or calories blank, or enter zero or negative calories or servings, I want a friendly message next to the field, so that I don't save bad data that throws off my totals.

## What the agent built

- `src/lib/validation.ts`: the meal rules written with Zod, each with a plain-English message ("Give the meal a name.", "Enter the calories per serving.", "Calories must be more than 0.", "Protein can't be negative.", …), plus a servings check for logging
- The meal form turns off the browser's own pop-up checks (`noValidate`), so these messages show under each field instead, and what you typed is kept
- The checks run **on the server** in the save action, so they can't be skipped. The database CHECK rules from Feature 2 are the last line of defense.
- `src/lib/validation.test.ts`: 13 small checks covering each message

## Checked in the browser (local)

Submitted the new-meal form with a blank name, blank calories, and protein = -5. It showed "Give the meal a name.", "Enter the calories per serving.", and "Protein can't be negative.", and kept -5 in the box. Screenshot: `docs/evidence/validation-messages.jpg`.

## What went sideways

- The agent's first draft of the Zod rules was convoluted (nested pre-processing to tell "blank" apart from "0"). It rewrote it as "check as text first (blank?), then convert (a number? above 0?)", which is easier to read and explain.
- TypeScript then rejected that version (`ZodCoercedNumber<unknown>` vs `string`). Fixed by telling Zod the input is text: `z.coerce.number<string>()`.

## Decisions the agent made

- Upper limits I didn't ask for: calories ≤ 10,000 per serving, protein ≤ 1,000 g, servings ≤ 20, name ≤ 80 characters. They catch typos like an extra zero.
