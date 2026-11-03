# Prompt log: PLAN.md

Agent: Claude Code (desktop app). Session date: Tue Nov 3, 2026. Prompts are mine, quoted as typed. Agent replies are shortened excerpts.

## 1. Choosing the idea

**Me:** "Okay here's the brief. I just want you to digest it, then with it mind help me brainstorm an idea. don't start on anything yet"

**Agent (excerpt):** Flagged that everything is due Wed Nov 4, so the idea should have "the simplest possible data, and data you can type in from memory." Pitched three options: a grade/deadline tracker, a movie log, and a Bay Area food log.

**Me:** "1. Yea 2. Recipe making (but that was a group project) / meal prep 3. Tracking calories 4. Reading news (maybe an app that synethsizes interesting stories and separates trends from principles/ lessons) 5. Working out (but my teammate is doing a workout tracker/ suggester sooo) 6. Career planning / figuring out where I want to live. … im not presenting tmrw but this needs to be polished so i get the best grade"

**Agent (excerpt):** Recommended meal prep + calorie tracking as the best fit ("You'd use it every day, and today's meals count as your 5 real entries"). Proposed three versions: A) a simple calorie log, B) a meal-prep batch tracker, C) A as the core with batches as one of my 3 features.

**Me:** "so you feel pretty strongly on the calorie counter? you think its fine that its not an oriignal idea, i.e. these apps already exist"

**Agent (excerpt):** "Originality isn't graded." The meal-prep angle is what makes it mine, since existing apps are "built around logging individual foods, not around prepped batches." Also laid out the news idea as a no-AI reading journal.

**Me:** "Well i don't already use an app like that. I like both ideas tbh. Maybe I like the news more … You seem worried that it would use AI - is that because of something in the brief? … one concern here is paywalls - i have subscriptions ot NYT, FT etc"

**Agent (excerpt):** The brief doesn't forbid AI. The risk is that outside services can fail on the live URL during grading. Full NYT/FT articles can't legitimately be pulled into an app, only headlines, summaries and links.

**Me:** "hmm maybe the news idea is too clunky. what i really care about is getting a great grade"

**Agent (excerpt):** Recommended the meal-prep calorie tracker, version C, and mapped it against each rubric category. It has no outside services, so nothing can fail on the live URL, and "average daily calories" is a clean, deterministic test.

**My decision:** meal-prep calorie tracker, version C.

## 2. Writing the plan

**Me:** "so can you backwards induct from those outcomes and get started?"

**Agent (excerpt):** Drafted PLAN.md with defaults filled in for me to approve or change: the name "Prepped", a 2,200 calorie default goal, calories + protein, breakfast/lunch/dinner/snack slots, my 3 features (goal progress bar, meal-prep batches, logging streak), a green accent, and MacroFactor + Apple Health as inspiration. The stack reuses my Assignment 1 setup (Next.js, Neon, Vercel), with Better Auth so accounts live in my own users table.

**Me:** "Approve as is"

## Who decided what

- **Me:** the idea (meal prep + calories over the news journal), version C, prioritizing a reliable build for the grade, and approving every default in the draft.
- **Agent, which I accepted without changes:** the exact feature wording, the table and column design, the test scenarios, and the tech choices.
