# Prompt log: Stranger test fix, food library

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me (passing on the tester's notes):** "maybe the "log a meal" dropped down should have tonnes of pre-saved things? like you select from the drop down, and it tells you the calories and protein. you can adjust and save if you want (with a revert to original macros in case it gets messed up). note this probably requires us having a database."

The same message had two other notes: start on the Today page rather than the dashboard, and a sign-up questionnaire that works out calorie and protein targets.

**Agent (excerpt):** picked the food library as the fix, "since a new user can't log anything until they invent a meal." The app already lands on Today after sign-up and login, so the agent didn't change anything for the first note. The questionnaire was left for me to decide.

## What the agent built

- **New `foods` table**: the shared library. Each row has a name, serving size ("2 large eggs"), suggested slot, calories and protein. Nobody owns it, and nothing in the app writes to it. Migration `drizzle/0004_food_library.sql`.
- **129 starter foods** in `drizzle/0005_seed_food_library.sql`. These are rounded typical values from USDA FoodData Central and common labels. Because the seed is a migration, the live database gets it on the next deploy.
- **`meals.food_id`** (optional): when I log a library food, it's **copied into my meals** with a pointer back to the library row. My edits change only my copy.
- **Today → Log a meal**: one dropdown with **My meals** first, then the library grouped by Breakfast / Lunch / Dinner / Snack. Picking a library food shows its serving size and **editable calories and protein**, plus **"Revert to 180 cal · 12 g"** once I change them. Logging it saves it to my meals, so it's one tap next time, and removes it from the library list.
- **Meal page**: "From the food library: 1 serving = …". If I've edited the numbers, **"Restore library values"** puts them back.
- The old empty state ("Add a meal first") is gone. A "Not in the list? Create your own meal" link stays under the form.
- `src/lib/foods.test.ts`: 5 automated checks. A new account gets 100+ foods. A logged library food becomes *my* meal only (Ben still sees the library and has no meals). Adding the same food twice reuses my meal. Restore works, but not on someone else's meal. Library foods I already have by name are hidden. 39 tests total.

## Bug the agent caught while checking (and fixed in this PR)

After a failed log (blank calories), React reset the form. The dropdown went back to its first option (**Banana**) while the panel below still showed **Apple's** numbers, so pressing Log again would have logged the wrong food. Found in a screenshot of the error state. Fix: the form submits through `onSubmit` instead of the `action` prop, which stops React's automatic reset. A failed log now keeps what I picked and typed.

## Checked in the browser (local, brand-new account)

- New account → Today → dropdown lists all 129 foods by slot (`docs/evidence/food-library-log.jpg`)
- Banana → changed 105 to 120 → "Revert to 105 cal · 1 g" appeared → Revert put back 105 and hid the button
- Logged 2 × Banana at 120 → Today shows 240 cal. Banana moved to "My meals" and left the library list
- Meal page → "Restore library values" → back to 105, button gone
- "Log 1 serving today" on the meal page still works (its form field was renamed in this PR)
- Blank calories → "Enter the calories per serving." and nothing was logged
- 375px phone width: nothing overflows. Revert wraps under the inputs
- Typecheck and lint pass

## Decisions the agent made (worth owning)

- **Copy, don't share.** Logging a library food makes my own meal instead of linking log entries straight to the library. Stars, batches, search and the dashboard keep working unchanged, and data isolation stays simple.
- **Values are typical estimates**, not label-exact. The form says "Adjust the numbers to match your portion or label."
- **Restoring changes past entries too.** Calories for a log entry are worked out from the meal (PLAN.md: "Calculated, not stored"), so editing or restoring a meal's numbers also changes its earlier days. Same as editing any meal.
- **One long dropdown, not a search box.** It's grouped by slot, and typing a letter jumps through it. A searchable picker would be the next step if the list grows.

## Not fixed (from the same notes)

- **Start on Today, not the dashboard:** sign-up and login already go to Today. Need to ask the tester what they actually saw.
- **Sign-up questionnaire for calorie and protein targets:** not built. It needs a protein goal (which the app doesn't have) and health formulas I'd have to choose and stand behind. It would also add steps before someone can log their first meal, which is the problem this PR fixes. The 2,200 default plus "Edit goal" covers it for now.
