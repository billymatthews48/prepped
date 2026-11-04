# Prompt log: Targets questionnaire (stranger test, struggle #2)

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompts

**Me (passing on the tester's note):** "it'd be cool if the app helped me actually set a calorie and protein goal. like maybe when you sign up, you fill in a short questionnaire on your stats and goals and habits, then it gives you calorie and protein targets?"

**Agent (first answer, excerpt):** left it out of PR #38 because it "adds steps before the first log, which is the problem this PR fixes," and suggested it as my "what I decided not to fix" answer.

**Me:** "why havent you added the questionnaire? it can ask age, height, weight, exercise level, goals."

**Agent (excerpt):** "Skip for now" solves the extra-step problem, and the start page becomes the "not fixed" answer instead. Then it built this.

## What the agent built

- **`/setup`, "Set your targets":** age, sex, height (ft + in), weight (lb), how active you are (5 levels) and goal (lose, lose slowly, maintain, build muscle). **Sign-up now lands here**, with **Skip for now** to go straight to Today. "Set targets" on Today opens it again any time.
- **Targets update live as you answer**, with one line explaining them: "You burn about 1,780 cal at rest, so about 2,760 a day at your activity level. Your goal adjusts that by −500."
- **Saving** sets the calorie goal and a **new protein goal** (`users.daily_protein_goal`, migration `0006_protein_goal.sql`). The server works the targets out again from the answers instead of trusting numbers sent from the page.
- **Today** shows protein against the goal ("136 / 160 g"). **Dashboard** shows "goal 160 g" under average protein.
- `src/lib/targets.ts` holds the formula as pure functions, so the browser and the server use the same code.
- `src/lib/targets.test.ts`: 6 checks. A hand-worked example (male, 30, 180 cm, 80 kg, moderate → 2,760 maintain / 2,260 lose / 3,010 gain), the 1,200 floor, feet/inches/pounds to metric, a friendly message for every bad answer, the 2,200 default with no protein goal, and saving my targets without touching another user's. 45 tests total.

## The formula (decisions the agent made, worth owning)

- **Resting calories: Mifflin-St Jeor**, the standard formula: 10 × kg + 6.25 × cm − 5 × age, then +5 (male) or −161 (female). **"Prefer not to say" uses the midpoint (−78).** The formula needs sex, which wasn't on my list, so the agent added it with an opt-out.
- **× activity:** 1.2 / 1.375 / 1.55 / 1.725 / 1.9.
- **Goal:** −500 (about 1 lb a week), −250, 0, or +250 calories.
- **Protein:** 2.0 g per kg when losing (to keep muscle), 1.6 maintaining, 1.8 building.
- **Never below 1,200 calories**, and the page says so when that kicks in. Adults only (18+).
- **Body stats aren't stored.** Only the two resulting goals are saved, so the app keeps no more personal data than it needs. The trade-off: redoing the questionnaire means typing the answers again.
- "Edit goal" on Today still changes calories by hand. Protein is only set through the questionnaire for now.

## Bug the agent caught while checking (fixed here)

After an empty "Use these targets", all six red messages stayed on screen even after each answer was filled in. Each message now disappears as soon as its answer is valid.

## Checked in the browser (local, brand-new account, 375px wide)

- Sign up → lands on Set your targets
- Empty save → six friendly messages. Filling in age cleared only the age message
- 30, male, 5′11″, 176 lb, 3–5 days a week, lose → "2,260 cal · 160 g protein" (matches the hand calculation)
- Use these targets → Today shows "0 / 2,260" and "0 / 160 g". Dashboard shows "goal 160 g" and "at or under 2,260"
- No sideways scrolling at 375px. Typecheck, lint and 45 tests pass
