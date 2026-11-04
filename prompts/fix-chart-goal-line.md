# Prompt log: Fix, dashboard goal line disappears

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me:** "next step is a thorough review of the requirements and grading rubric to check we can get full marks"

**Agent (excerpt):** while retaking my dashboard screenshot as part of that review: "Found a real bug in the screenshot: **the goal line has disappeared**. Your new 3,000 goal is above the chart's top (2,400), so the line gets cut off."

## What happened, how it was noticed, how it was fixed

- **What:** the chart's y-axis only stretched to fit the bars. Once I set my targets, my goal (3,000) was higher than every day I'd logged (2,290 at most), so the dashed goal line was outside the chart and Recharts dropped it. It affects anyone whose goal is above all their logged days, which is common in the first few days.
- **How it was noticed:** by looking at the screenshot that's going into my submission, not by a test.
- **Fix:** one setting, `ifOverflow="extendDomain"` on the goal line, which stretches the axis to include the goal.
- **The agent also got something wrong** while writing the Issue: it first claimed that new accounts with nothing logged never saw the goal line either. Checking showed those accounts get a "Log a few meals" message instead of a chart, so the claim was removed before the PR.

## Checked

- Live, before the fix: goal 3,000, axis tops out at 2,400, no goal line
- Local, after the fix: one 105-cal day with a 2,200 goal → axis 0–2,200, "Goal 2,200" line drawn
- Typecheck and lint pass
