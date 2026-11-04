# Prompt log: Targets, units, date of birth, bigger button

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me:** "Let's make the "set target" button bigger and more prominent. All new accounts should land on that page first btw. Also, let's give people the option to choose their metric - e.g. imperial or metric. We should also have then put in DOB rather than age"

**Agent (excerpt):** new accounts already land on the questionnaire (since PR #40), so no change was needed there. Everything else went into this PR.

## What the agent built

- **Imperial / Metric switch** at the top of the questionnaire. Metric asks for height in cm and weight in kg. **Switching converts whatever's already typed** (5′11″ and 176 lb become 180 cm and 79.8 kg), so the targets don't change.
- **Date of birth instead of age.** Age is worked out from it as of today *in my time zone* (the same "today" the rest of the app uses), and you're one year younger until the birthday. The date picker won't go past today.
- **Big "Set my targets" card on Today** (green, full-width button on phones) for anyone without targets yet. It says what their goal is now ("2,200 calories, with no protein goal"). Once targets are set it's replaced by a smaller **"Redo targets"** button next to "Edit goal".
- Tests in `src/lib/targets.test.ts`: metric answers give the same targets as imperial, age from date of birth (the day before, the day of, and a leap-day birthday), and blank, impossible (Feb 30) or future dates.

## Decisions the agent made (worth owning)

- **The units choice isn't saved.** It only changes how the questionnaire asks, and every number the app shows afterwards (calories, grams) is the same in both systems.
- **Date of birth isn't stored either**, the same as the other body stats. Only the two goals are saved.
- **Weight limits** are 30–320 kg (about 66–700 lb) in both units.

## Checked in the browser (local)

- Imperial: 20 May 1996, male, 5′11″, 176 lb, 3–5 days, lose → 2,260 cal · 160 g. Metric switch → 180 cm / 79.8 kg, same targets. Back to imperial → 5′11″ / 176 lb
- Saved in metric → Today shows 0 / 2,260 and 0 / 160 g, plus "Redo targets"
- New account (Ben) → sign-up lands on Set your targets → Skip for now → Today shows the "Get your personal targets" card
- 375px: no overflow, and the "Set my targets" button is 301 × 48 px. Typecheck, lint and 52 tests pass
