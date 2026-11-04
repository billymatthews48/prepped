# Prompt log: Fix, Dashboard tab cut off on phones

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me:** "are you fully blocked? you can't do anything else without my help?"

**Agent (excerpt):** "No. Three things don't need you…", including "a phone-width check of every page before your stranger sees it, so they struggle with the design rather than a layout bug."

## What the agent found

At 375px (iPhone width) on every signed-in page, the nav's last link ("Dashboard") ended at 406px. The page didn't scroll sideways, because the nav row scrolled on its own, so the Dashboard tab was simply hidden off the right edge unless you swiped the nav. Found by measuring every element's right edge in the browser, not by eye.

## Fix

On phones the nav is a 5-column grid with slightly smaller text, so all tabs are always visible. From the `sm` breakpoint up, it's the same row as before.

## Checked

- 375px: Today 16–81, Meals 85–151, Fridge 155–220, ★ Starred 224–290, Dashboard 294–359. All inside 375, none clipped (`docs/evidence/mobile-nav-fixed.jpg`)
- 1024px: still a flex row, natural widths
- Typecheck and lint pass

## Noticed but not fixed

The dashboard's "Most-logged meal" tile shortens long names with "…" on phones. Left as is for now. Worth watching whether the stranger trips on it.
