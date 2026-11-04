# Prepped

**A meal-prep calorie tracker.** Save the meals you actually cook, log a serving in one tap, see calories and protein against your daily goal, and know how many prepped servings are left in the fridge.

**Live app:** https://prepped-beta.vercel.app

Built for my capstone (Classes 1–10). The plan came first ([PLAN.md](PLAN.md)), then one feature per pull request, each with an Issue, a branch and a prompt log in [`prompts/`](prompts/).

## What you can do

| Feature | Where |
|---|---|
| Sign up, log in, log out (each account sees only its own data) | `/signup`, `/login` |
| Add, view, edit and delete meals (delete asks "Are you sure?") | `/meals` |
| Friendly messages for blank or impossible values | meal and log forms |
| Log servings to any day and see the day's calories and protein | `/today` |
| Star go-to meals and see them in one place | ☆ on any meal, `/starred` |
| Search, filter by slot, sort by newest / calories / protein / most logged | `/meals` |
| Dashboard: 14-day chart against your goal, plus summary stats | `/dashboard` |
| **Daily goal + progress bar** ("1,450 / 2,200 · 750 left") | `/today` |
| **Meal-prep batches**: record a prep session, and servings left count down as you eat | meal page, `/fridge` |
| **Logging streak** | `/today`, `/dashboard` |
| **Food library** (added after the stranger test): 129 common foods in the "Log a meal" dropdown. Adjust the calories and protein before logging, revert to the library numbers, and restore them later from the meal page | `/today`, meal page |
| **Targets questionnaire** (added after the stranger test): age, sex, height, weight, activity and goal give you a daily calorie and protein target (Mifflin-St Jeor). New accounts see it right after sign-up, with "Skip for now" | `/setup`, "Set targets" on `/today` |
| **Greeting + profile**: "Good evening, Billy" with a one-line summary of the day, your initial and name in the header, and a profile page with your goals and stats | `/today`, `/profile` |

## How it works

```
Browser ──(forms / clicks)──▶ Next.js server actions ──▶ src/lib/* data functions ──▶ Postgres
   ▲                                │ check who you are (login cookie)        │ every query filters
   └────── HTML for your data ◀─────┘ and validate the input                   │ on your user_id
```

- **Taking in data:** every form (sign up, add meal, log a serving, set a goal, add a batch) posts to a **server action** on the Next.js server. The action first finds the signed-in user from the login cookie, then checks the input (`src/lib/validation.ts`). If something's wrong, it sends back a friendly message for that field.
- **Storing data:** six tables in Postgres (`users`, `meals`, `log_entries`, `batches`, `stars`, and the shared, read-only `foods` library), described in [schema.md](schema.md). The database also enforces the basics itself (calories > 0, servings > 0, valid slot), so a bug in the app can't save nonsense.
- **Keeping it private:** every function in `src/lib/` takes the signed-in user's id and filters on it. An id in the URL is never enough on its own. An automated test proves User B can't see User A's meals.
- **Calculated, not stored:** calories for an entry (meal × servings), daily totals, averages, servings left in a batch and streaks are all worked out from the log when you load a page, so they can't fall out of sync.

## Tools

| Tool | Used for |
|---|---|
| Claude Code (desktop app) | The AI coding agent that built each feature on its own branch |
| Next.js 16 + TypeScript | The app: pages, forms and server actions |
| Tailwind CSS v4 | Styling (mobile-first) |
| Neon (Postgres) | The production database |
| Drizzle ORM | Table definitions in code (`src/db/schema.ts`) and migrations (`drizzle/`) |
| Better Auth | Email + password accounts stored in my own `users` table |
| Zod | Input validation with friendly messages |
| Recharts | The dashboard chart |
| Vitest + PGlite | Automated tests against a real, throwaway, in-memory Postgres |
| Vercel | Hosting. Every merge to `main` redeploys. |

## Run it locally

Requires Node.js 22+.

```bash
git clone https://github.com/billymatthews48/prepped.git
cd prepped
npm install
```

Create `.env.local` with a local login secret:

```bash
BETTER_AUTH_SECRET=any-long-random-string
BETTER_AUTH_URL=http://localhost:3010
```

```bash
npm run dev -- --port 3010
```

Open http://localhost:3010 and sign up. Locally there's no `DATABASE_URL`, so the app uses **PGlite**, a real Postgres that runs inside Node and saves to `.pglite/`. `npm run dev` applies the migrations first. If the dev server is force-stopped, that folder can get damaged; the next `npm run dev` notices and rebuilds it empty.

## Tests

```bash
npm test
```

49 checks, including the two the brief requires:

- **Data isolation** (`src/lib/data-isolation.test.ts`): User B can't see or open User A's meal.
- **Dashboard stat** (`src/lib/dashboard.test.ts`): average daily calories counts only the days you logged (2,000 and 2,400 → 2,200).

Red/green screenshots for both are in [`docs/evidence/`](docs/evidence/) and in PRs [#12](https://github.com/billymatthews48/prepped/pull/12) and [#22](https://github.com/billymatthews48/prepped/pull/22).

Other checks: `npm run typecheck`, `npm run lint`.

## Deploying

Vercel builds every push. On **production** builds only, `scripts/migrate.mjs` applies any new migrations to Neon before `next build`, so unmerged branches never change the live database. Production needs `DATABASE_URL` (added by the Neon integration) and `BETTER_AUTH_SECRET`.

## Project docs

- [PLAN.md](PLAN.md): the original plan (merged first, in PR #2), plus Plan vs. Reality at the end
- [schema.md](schema.md): every table and how they connect
- [`prompts/`](prompts/): the prompt log for each feature
