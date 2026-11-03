# Prompt log: Setup (app skeleton + deploy)

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me:** "so can you backwards induct from those outcomes and get started?" (after approving PLAN.md: "Approve as is")

## What the agent did

- Scaffolded Next.js 16 (TypeScript, App Router, Tailwind CSS v4) with `create-next-app` and copied it into the repo on this branch.
- Applied the PLAN.md design: off-white background, slate text, green accent, amber for over-goal, set up as theme colors in `globals.css`. Added a minimal header ("Prepped.") and a one-line landing page.
- Added Vitest and `typecheck` / `test` scripts so later features can add tests.

## Decisions the agent made (and I accepted)

- **Turned off Next.js "Cache Components."** The agent said: "Next.js 16 turns on a newer caching mode by default … It makes any page that reads the login cookie fail to build unless it's wrapped a specific way. To keep this reliable for tomorrow, I'll switch it off." Not in PLAN.md; a technical call by the agent.
- **Bumped `@types/node` from 20 to 24.** Vitest 5 wouldn't install alongside Node 20 types. It matches the Node 24 runtime anyway.
- **Local database = PGlite** (an in-process Postgres saved to `.pglite/`, git-ignored). Local testing never touches the live Neon database where my real entries live.
